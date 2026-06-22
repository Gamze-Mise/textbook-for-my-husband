import { NextResponse } from "next/server";
import { buildQuizQuestionsForWords } from "@/lib/buildQuizQuestions";
import { prisma } from "@/lib/prisma";
import { isPreviewUserId, requirePreviewUserId } from "@/lib/preview/server";

export async function GET() {
  const userId = requirePreviewUserId();
  if (!isPreviewUserId(userId)) return userId;

  const words = await prisma.word.findMany({
    where: { userId },
  });

  const built = buildQuizQuestionsForWords(words);
  if (!built.ok) {
    return NextResponse.json({ error: built.error }, { status: built.status });
  }

  return NextResponse.json({ ok: true as const, questions: built.questions });
}
