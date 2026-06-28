"use client";

import { useMemo } from "react";
import { filterDeckByTab, mergePreviewDeck } from "@/lib/preview/deckUtils";
import { usePreviewBucketOverrides } from "@/lib/preview/usePreviewBucketOverrides";
import { usePreviewLocalWords } from "@/lib/preview/usePreviewLocalWords";
import type { AppMode } from "@/types/appMode";
import type { DeckTab, WordCard } from "@/types/word";

export function usePreviewDeck(
  mode: AppMode,
  serverWords: WordCard[],
  tab: DeckTab,
) {
  const { words: localWords, addWord } = usePreviewLocalWords();
  const { apply } = usePreviewBucketOverrides();

  const words = useMemo(() => {
    if (mode !== "preview") return serverWords;
    const merged = mergePreviewDeck(serverWords, localWords);
    return filterDeckByTab(apply(merged), tab);
  }, [mode, serverWords, localWords, tab, apply]);

  return { words, addLocalWord: addWord };
}
