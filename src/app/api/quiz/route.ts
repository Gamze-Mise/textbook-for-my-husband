import { NextResponse } from "next/server";
import type { Word, WordBucket } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { wordToClient } from "@/lib/wordSerialize";
import type { QuizQuestion } from "@/types/quiz";

const TARGET_QUESTIONS = 20;

/**
 * Higher = more likely to be picked when we sample 20 from a large eligible pool
 * (Efraimidis–Spirakis keys). FORGOTTEN / learning still dominate; known is possible but rare.
 */
function bucketWeight(bucket: WordBucket): number {
  if (bucket === "FORGOTTEN") return 80;
  if (bucket === "TO_STUDY") return 25;
  return 3;
}

/** Weighted random sample without replacement (one pass). */
function weightedPickWithoutReplacement<T extends { bucket: WordBucket }>(
  items: T[],
  k: number,
): T[] {
  if (k <= 0) return [];
  if (k >= items.length) return shuffle(items);
  return [...items]
    .map((item) => ({
      item,
      key: Math.random() ** (1 / bucketWeight(item.bucket)),
    }))
    .sort((a, b) => b.key - a.key)
    .slice(0, k)
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

function canFormQuizQuestion(w: Word, allWords: Word[]): boolean {
  const correct = w.meaning.trim();
  if (!correct) return false;
  const otherMeanings = allWords
    .filter((x) => x.id !== w.id)
    .map((x) => x.meaning.trim())
    .filter((m) => m.length > 0 && m !== correct);
  const uniqueWrong = [...new Set(otherMeanings)];
  return uniqueWrong.length >= 3;
}

function buildQuestionForWord(w: Word, allWords: Word[]): QuizQuestion | null {
  const correct = w.meaning.trim();
  if (!correct) return null;

  const otherMeanings = allWords
    .filter((x) => x.id !== w.id)
    .map((x) => x.meaning.trim())
    .filter((m) => m.length > 0 && m !== correct);

  const uniqueWrong = [...new Set(otherMeanings)];
  const wrongThree = shuffle(uniqueWrong).slice(0, 3);
  if (wrongThree.length < 3) return null;

  const choices = shuffle([
    correct,
    wrongThree[0],
    wrongThree[1],
    wrongThree[2],
  ]) as [string, string, string, string];
  const answerIndex = choices.indexOf(correct);
  if (answerIndex < 0) return null;

  const c = wordToClient(w);
  return {
    wordId: c.id,
    term: c.term,
    imageSrc: c.imageSrc,
    audioSrc: c.audioSrc,
    example: c.example,
    imageObjectPosition: c.imageObjectPosition,
    bucket: c.bucket,
    choices,
    answerIndex,
  };
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
  });

  if (words.length < 4) {
    return NextResponse.json(
      { error: "Add at least 4 words to take the quiz." },
      { status: 400 },
    );
  }

  const eligible = words.filter((w) => canFormQuizQuestion(w, words));
  const picked =
    eligible.length <= TARGET_QUESTIONS
      ? shuffle(eligible)
      : weightedPickWithoutReplacement(eligible, TARGET_QUESTIONS);

  const questions: QuizQuestion[] = [];
  for (const w of picked) {
    const q = buildQuestionForWord(w, words);
    if (q) questions.push(q);
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

  return NextResponse.json({ ok: true as const, questions: shuffle(questions) });
}
