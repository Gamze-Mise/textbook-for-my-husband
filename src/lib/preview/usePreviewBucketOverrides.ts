"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { WordBucket, WordCard } from "@/types/word";
import type { QuizQuestion } from "@/types/quiz";

const STORAGE_KEY = "vocabulary-preview-buckets-v1";
const EMPTY_OVERRIDES: Record<string, WordBucket> = {};

const listeners = new Set<() => void>();

let cachedRaw: string | null | undefined;
let cachedSnapshot: Record<string, WordBucket> = EMPTY_OVERRIDES;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((listener) => listener());
}

/** Stable snapshot for useSyncExternalStore — same reference until storage changes. */
function getPreviewBucketOverridesSnapshot(): Record<string, WordBucket> {
  if (typeof window === "undefined") return EMPTY_OVERRIDES;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedSnapshot;

    cachedRaw = raw;
    if (!raw) {
      cachedSnapshot = EMPTY_OVERRIDES;
      return cachedSnapshot;
    }

    const parsed = JSON.parse(raw) as Record<string, WordBucket>;
    if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
      cachedSnapshot = parsed;
    } else {
      cachedSnapshot = EMPTY_OVERRIDES;
    }
    return cachedSnapshot;
  } catch {
    cachedRaw = null;
    cachedSnapshot = EMPTY_OVERRIDES;
    return cachedSnapshot;
  }
}

export function readPreviewBucketOverrides(): Record<string, WordBucket> {
  return getPreviewBucketOverridesSnapshot();
}

export function applyPreviewBucketOverridesToWords(
  words: WordCard[],
): WordCard[] {
  const overrides = getPreviewBucketOverridesSnapshot();
  return words.map((w) =>
    overrides[w.id] ? { ...w, bucket: overrides[w.id] } : w,
  );
}

export function setPreviewBucketOverride(wordId: string, bucket: WordBucket) {
  const next = { ...getPreviewBucketOverridesSnapshot(), [wordId]: bucket };
  const raw = JSON.stringify(next);
  localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedSnapshot = next;
  emit();
}

export function clearPreviewBucketOverrides() {
  localStorage.removeItem(STORAGE_KEY);
  cachedRaw = null;
  cachedSnapshot = EMPTY_OVERRIDES;
  emit();
}

export function applyPreviewBucketOverridesToQuestions(
  questions: QuizQuestion[],
): QuizQuestion[] {
  const overrides = getPreviewBucketOverridesSnapshot();
  return questions.map((q) =>
    overrides[q.wordId] ? { ...q, bucket: overrides[q.wordId] } : q,
  );
}

export function usePreviewBucketOverrides() {
  const overrides = useSyncExternalStore(
    subscribe,
    getPreviewBucketOverridesSnapshot,
    () => EMPTY_OVERRIDES,
  );

  const apply = useCallback(
    (words: WordCard[]) =>
      words.map((w) =>
        overrides[w.id] ? { ...w, bucket: overrides[w.id] } : w,
      ),
    [overrides],
  );

  const setOverride = useCallback((wordId: string, bucket: WordBucket) => {
    setPreviewBucketOverride(wordId, bucket);
  }, []);

  return { apply, setOverride };
}
