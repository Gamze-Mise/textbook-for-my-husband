export type QuizQuestion = {
  wordId: string;
  term: string;
  imageSrc: string | null;
  audioSrc: string | null;
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
