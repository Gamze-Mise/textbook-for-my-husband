/** Deck filter tabs (includes synthetic "Mixed"). */
export type DeckTab = "KNOWN" | "TO_STUDY" | "FORGOTTEN" | "MIXED";

/** Stored per word in the database. */
export type WordBucket = "KNOWN" | "TO_STUDY" | "FORGOTTEN";

export type WordCard = {
  id: string;
  term: string;
  meaning: string;
  example: string | null;
  bucket: WordBucket;
  audioPublicId?: string | null;
  exampleAudioPublicId?: string | null;
  audioSrc: string | null;
  exampleAudioSrc?: string | null;
  imagePublicId?: string | null;
  imageSrc?: string | null;
};

export const STUDY_DECK_TABS: DeckTab[] = ["MIXED", "FORGOTTEN", "KNOWN"];

export function deckTabLabel(tab: DeckTab): string {
  switch (tab) {
    case "KNOWN":
      return "Known";
    case "TO_STUDY":
      return "Learning";
    case "FORGOTTEN":
      return "Needs review";
    case "MIXED":
      return "Mixed";
  }
}
