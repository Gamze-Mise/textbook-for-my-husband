import type { QuizQuestion } from "@/types/quiz";
import type { WordCard } from "@/types/word";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function canFormQuizQuestionForCard(w: WordCard, allWords: WordCard[]): boolean {
  const correct = w.meaning.trim();
  if (!correct) return false;
  const otherMeanings = allWords
    .filter((x) => x.id !== w.id)
    .map((x) => x.meaning.trim())
    .filter((m) => m.length > 0 && m !== correct);
  return [...new Set(otherMeanings)].length >= 3;
}

function buildQuestionForWordCard(
  w: WordCard,
  allWords: WordCard[],
): QuizQuestion | null {
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

  return {
    wordId: w.id,
    term: w.term,
    imageSrc: w.imageSrc ?? null,
    audioSrc: w.audioSrc ?? null,
    example: w.example,
    imageObjectPosition: w.imageObjectPosition ?? undefined,
    bucket: w.bucket,
    choices,
    answerIndex,
  };
}

/** Preview: local cards first (newest first), then server quiz questions. */
export function buildPreviewQuizQuestions(args: {
  localWords: WordCard[];
  allWords: WordCard[];
  serverQuestions: QuizQuestion[];
}): QuizQuestion[] {
  const { localWords, allWords, serverQuestions } = args;
  const localQuestions: QuizQuestion[] = [];
  const usedIds = new Set<string>();

  for (const w of localWords) {
    if (!canFormQuizQuestionForCard(w, allWords)) continue;
    const q = buildQuestionForWordCard(w, allWords);
    if (!q) continue;
    localQuestions.push(q);
    usedIds.add(q.wordId);
  }

  const rest = serverQuestions.filter((q) => !usedIds.has(q.wordId));
  return [...localQuestions, ...rest];
}
