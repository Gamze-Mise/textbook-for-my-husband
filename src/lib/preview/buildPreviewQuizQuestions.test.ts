import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPreviewQuizQuestions } from "@/lib/preview/buildPreviewQuizQuestions";
import type { QuizQuestion } from "@/types/quiz";
import type { WordCard } from "@/types/word";

function card(id: string, meaning: string): WordCard {
  return {
    id,
    term: id,
    meaning,
    example: null,
    bucket: "FORGOTTEN",
    audioPublicId: null,
    exampleAudioPublicId: null,
    audioSrc: null,
    exampleAudioSrc: null,
    imagePublicId: null,
    imageSrc: null,
  };
}

function serverQuestion(wordId: string): QuizQuestion {
  return {
    wordId,
    term: wordId,
    imageSrc: null,
    audioSrc: null,
    example: null,
    bucket: "FORGOTTEN",
    choices: ["a", "b", "c", "d"],
    answerIndex: 0,
  };
}

describe("buildPreviewQuizQuestions", () => {
  it("puts local word questions before server questions", () => {
    const allWords = [
      card("preview-1", "one"),
      card("preview-2", "two"),
      card("server-1", "three"),
      card("server-2", "four"),
      card("server-3", "five"),
      card("server-4", "six"),
    ];
    const localWords = [card("preview-1", "one"), card("preview-2", "two")];
    const serverQuestions = [
      serverQuestion("server-1"),
      serverQuestion("server-2"),
      serverQuestion("preview-1"),
    ];

    const questions = buildPreviewQuizQuestions({
      localWords,
      allWords,
      serverQuestions,
    });

    assert.ok(questions.length >= 2);
    assert.equal(questions[0].wordId, "preview-1");
    assert.equal(questions[1].wordId, "preview-2");
    assert.ok(questions.every((q) => q.wordId !== "preview-1" || questions.indexOf(q) < 2));
    assert.ok(!questions.slice(2).some((q) => q.wordId.startsWith("preview-")));
  });
});
