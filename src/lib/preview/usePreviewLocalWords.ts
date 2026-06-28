"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  type StoredPreviewWord,
  storedPreviewWordToCard,
} from "@/lib/preview/previewLocalWord";
import type { WordBucket, WordCard } from "@/types/word";

const STORAGE_KEY = "vocabulary-preview-words-v1";
const EMPTY_WORDS: WordCard[] = [];

const listeners = new Set<() => void>();

let cachedRaw: string | null | undefined;
let cachedSnapshot: WordCard[] = EMPTY_WORDS;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((listener) => listener());
}

function readStored(): StoredPreviewWord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredPreviewWord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStored(words: StoredPreviewWord[]) {
  const raw = JSON.stringify(words);
  localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedSnapshot = words.map(storedPreviewWordToCard);
  emit();
}

function getPreviewLocalWordsSnapshot(): WordCard[] {
  if (typeof window === "undefined") return EMPTY_WORDS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedSnapshot;

    cachedRaw = raw;
    if (!raw) {
      cachedSnapshot = EMPTY_WORDS;
      return cachedSnapshot;
    }

    const parsed = JSON.parse(raw) as StoredPreviewWord[];
    cachedSnapshot = Array.isArray(parsed)
      ? [...parsed]
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .map(storedPreviewWordToCard)
      : EMPTY_WORDS;
    return cachedSnapshot;
  } catch {
    cachedRaw = null;
    cachedSnapshot = EMPTY_WORDS;
    return cachedSnapshot;
  }
}

export type AddPreviewLocalWordInput = {
  term: string;
  meaning: string;
  example: string | null;
  bucket?: WordBucket;
  imageDataUrl?: string | null;
  imageFocusX?: number;
  imageFocusY?: number;
};

export function addPreviewLocalWord(input: AddPreviewLocalWordInput): WordCard {
  const stored: StoredPreviewWord = {
    id: `preview-${crypto.randomUUID()}`,
    term: input.term,
    meaning: input.meaning,
    example: input.example,
    bucket: input.bucket ?? "FORGOTTEN",
    imageDataUrl: input.imageDataUrl ?? null,
    imageFocusX: input.imageFocusX ?? null,
    imageFocusY: input.imageFocusY ?? null,
    createdAt: new Date().toISOString(),
  };
  writeStored([...readStored(), stored]);
  return storedPreviewWordToCard(stored);
}

export function usePreviewLocalWords() {
  const words = useSyncExternalStore(
    subscribe,
    getPreviewLocalWordsSnapshot,
    () => EMPTY_WORDS,
  );

  const addWord = useCallback((input: AddPreviewLocalWordInput) => {
    return addPreviewLocalWord(input);
  }, []);

  return { words, addWord };
}
