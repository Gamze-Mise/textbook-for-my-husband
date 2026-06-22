import type { AppMode } from "@/types/appMode";
import type { WordBucket } from "@/types/word";

export async function persistWordBucket(
  mode: AppMode,
  wordId: string,
  bucket: WordBucket,
  setOverride: (wordId: string, bucket: WordBucket) => void,
): Promise<boolean> {
  if (mode === "preview") {
    setOverride(wordId, bucket);
    return true;
  }

  const res = await fetch(`/api/words/${wordId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ bucket }),
  });

  return res.ok;
}
