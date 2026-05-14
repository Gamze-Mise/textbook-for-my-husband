import type { WordBucket } from "@/types/word";

export type QuizQuestion = {
  wordId: string;
  term: string;
  imageSrc: string | null;
  audioSrc: string | null;
  /** Shown after the learner picks an answer. */
  example: string | null;
  /** CSS object-position for the illustration (from library framing). */
  imageObjectPosition?: string;
  /** Deck bucket when the quiz was built (used to skip redundant PATCH). */
  bucket: WordBucket;
  choices: [string, string, string, string];
  answerIndex: number;
};

export function quizCorrectCount(
  questions: Pick<QuizQuestion, "answerIndex">[],
  picked: (number | null)[],
): number {
  let n = 0;
  for (let i = 0; i < questions.length; i++) {
    if (picked[i] === questions[i].answerIndex) n += 1;
  }
  return n;
}
