import type { DeckTab, WordCard } from "@/types/word";

export function mergePreviewDeck(
  serverWords: WordCard[],
  localWords: WordCard[],
): WordCard[] {
  return [...localWords, ...serverWords];
}

export function filterDeckByTab(words: WordCard[], tab: DeckTab): WordCard[] {
  if (tab === "MIXED") return words;
  return words.filter((w) => w.bucket === tab);
}
