import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mergePreviewDeck } from "@/lib/preview/deckUtils";
import type { WordCard } from "@/types/word";

function card(id: string): WordCard {
  return {
    id,
    term: id,
    meaning: `meaning-${id}`,
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

describe("mergePreviewDeck", () => {
  it("places local words before server words", () => {
    const merged = mergePreviewDeck(
      [card("server-a"), card("server-b")],
      [card("preview-a"), card("preview-b")],
    );
    assert.deepEqual(
      merged.map((w) => w.id),
      ["preview-a", "preview-b", "server-a", "server-b"],
    );
  });
});
