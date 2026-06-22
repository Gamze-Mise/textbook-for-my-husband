import { objectPositionFromFocus } from "@/lib/wordImageFocus";
import type { WordBucket, WordCard } from "@/types/word";

export type StoredPreviewWord = {
  id: string;
  term: string;
  meaning: string;
  example: string | null;
  bucket: WordBucket;
  imageDataUrl?: string | null;
  imageFocusX?: number | null;
  imageFocusY?: number | null;
  createdAt: string;
};

export function storedPreviewWordToCard(stored: StoredPreviewWord): WordCard {
  return {
    id: stored.id,
    term: stored.term,
    meaning: stored.meaning,
    example: stored.example,
    bucket: stored.bucket,
    audioPublicId: null,
    exampleAudioPublicId: null,
    audioSrc: null,
    exampleAudioSrc: null,
    imagePublicId: null,
    imageSrc: stored.imageDataUrl ?? null,
    imageFocusX: stored.imageFocusX,
    imageFocusY: stored.imageFocusY,
    imageObjectPosition: objectPositionFromFocus(
      stored.imageFocusX,
      stored.imageFocusY,
    ),
  };
}

export function isPreviewLocalWordId(id: string): boolean {
  return id.startsWith("preview-");
}
