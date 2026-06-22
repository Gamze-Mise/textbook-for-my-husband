import type { Word, WordBucket } from "@prisma/client";
import { wordToClient } from "@/lib/wordSerialize";
import type { QuizQuestion } from "@/types/quiz";

export const QUIZ_TARGET_QUESTIONS = 20;

function bucketWeight(bucket: WordBucket): number {
  if (bucket === "FORGOTTEN") return 80;
  if (bucket === "TO_STUDY") return 25;
  return 3;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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

function canFormQuizQuestion(w: Word, allWords: Word[]): boolean {
  const correct = w.meaning.trim();
  if (!correct) return false;
  const otherMeanings = allWords
    .filter((x) => x.id !== w.id)
    .map((x) => x.meaning.trim())
    .filter((m) => m.length > 0 && m !== correct);
  return [...new Set(otherMeanings)].length >= 3;
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

export type BuildQuizResult =
  | { ok: true; questions: QuizQuestion[] }
  | { ok: false; error: string; status: number };

export function buildQuizQuestionsForWords(words: Word[]): BuildQuizResult {
  if (words.length < 4) {
    return {
      ok: false,
      status: 400,
      error: "Add at least 4 words to take the quiz.",
    };
  }

  const eligible = words.filter((w) => canFormQuizQuestion(w, words));
  const picked =
    eligible.length <= QUIZ_TARGET_QUESTIONS
      ? shuffle(eligible)
      : weightedPickWithoutReplacement(eligible, QUIZ_TARGET_QUESTIONS);

  const questions: QuizQuestion[] = [];
  for (const w of picked) {
    const q = buildQuestionForWord(w, words);
    if (q) questions.push(q);
  }

  if (questions.length === 0) {
    return {
      ok: false,
      status: 400,
      error:
        "Could not build a quiz. Add more cards with different meanings so each word has three distinct wrong answers.",
    };
  }

  return { ok: true, questions: shuffle(questions) };
}
