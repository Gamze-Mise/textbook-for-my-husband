import { NextResponse } from "next/server";
import type { WordBucket } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { wordToClient } from "@/lib/wordSerialize";
import type { QuizQuestion } from "@/types/quiz";

const TARGET_QUESTIONS = 20;

/** Higher = more likely in the quiz. Forgotten / needs review dominates; known is rare. */
function bucketWeight(bucket: WordBucket): number {
  if (bucket === "FORGOTTEN") return 30;
  return 1;
}

function weightedShuffle<T extends { bucket: WordBucket }>(items: T[]): T[] {
  return [...items]
    .map((item) => ({
      item,
      score:
        -Math.log(Math.random() + Number.EPSILON) / bucketWeight(item.bucket),
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = Number(userId);
  if (!Number.isFinite(uid)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const words = await prisma.word.findMany({
    where: { userId: uid },
    orderBy: { createdAt: "desc" },
  });

  if (words.length < 4) {
    return NextResponse.json(
      { error: "Add at least 4 words to take the quiz." },
      { status: 400 },
    );
  }

  const order = weightedShuffle(words);
  const questions: QuizQuestion[] = [];

  for (const w of order) {
    if (questions.length >= TARGET_QUESTIONS) break;

    const correct = w.meaning.trim();
    if (!correct) continue;

    const otherMeanings = words
      .filter((x) => x.id !== w.id)
      .map((x) => x.meaning.trim())
      .filter((m) => m.length > 0 && m !== correct);

    const uniqueWrong = [...new Set(otherMeanings)];
    const wrongThree = shuffle(uniqueWrong).slice(0, 3);
    if (wrongThree.length < 3) continue;

    const choices = shuffle([
      correct,
      wrongThree[0],
      wrongThree[1],
      wrongThree[2],
    ]) as [string, string, string, string];
    const answerIndex = choices.indexOf(correct);
    if (answerIndex < 0) continue;

    const c = wordToClient(w);
    questions.push({
      wordId: c.id,
      term: c.term,
      imageSrc: c.imageSrc,
      audioSrc: c.audioSrc,
      example: c.example,
      imageObjectPosition: c.imageObjectPosition,
      bucket: c.bucket,
      choices,
      answerIndex,
    });
  }

  if (questions.length === 0) {
    return NextResponse.json(
      {
        error:
          "Could not build a quiz. Add more cards with different meanings so each word has three distinct wrong answers.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true as const, questions });
}
