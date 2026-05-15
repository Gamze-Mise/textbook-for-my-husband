import type { WordBucket } from "@/types/word";

export function wordBucketBadgeClass(bucket: WordBucket): string {
  switch (bucket) {
    case "KNOWN":
      return "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-800/80 dark:bg-emerald-950/45 dark:text-emerald-50";
    case "TO_STUDY":
      return "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-800/80 dark:bg-sky-950/40 dark:text-sky-50";
    case "FORGOTTEN":
      return "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800/80 dark:bg-amber-950/40 dark:text-amber-50";
  }
}
