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
  /** 0–100, null = center. */
  imageFocusX?: number | null;
  imageFocusY?: number | null;
  /** CSS object-position for cropped illustrations. */
  imageObjectPosition?: string;
};

export const STUDY_DECK_TABS: DeckTab[] = ["MIXED", "FORGOTTEN", "KNOWN"];

/** Human-readable status for a stored word bucket (library cards, filters). */
export function wordBucketLabel(bucket: WordBucket): string {
  switch (bucket) {
    case "KNOWN":
      return "Known";
    case "TO_STUDY":
      return "Learning";
    case "FORGOTTEN":
      return "Needs review";
  }
}

export function deckTabLabel(tab: DeckTab): string {
  if (tab === "MIXED") return "Mixed";
  return wordBucketLabel(tab);
}
