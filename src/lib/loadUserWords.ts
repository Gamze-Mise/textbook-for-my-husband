import { orderMixedDeck } from "@/lib/mixedDeckOrder";
import { prisma } from "@/lib/prisma";
import { wordToClient } from "@/lib/wordSerialize";
import type { WordCard } from "@/types/word";

export type WordSortOrder = "newest" | "oldest";

export async function loadUserWords(args: {
  userId: number;
  bucket: string | null;
  forLibrary: boolean;
  sortOrder?: WordSortOrder;
}): Promise<WordCard[]> {
  const { userId, bucket, forLibrary, sortOrder = "newest" } = args;
  const chronological = sortOrder === "oldest";
  const orderBy = chronological
    ? [{ createdAt: "asc" as const }, { id: "asc" as const }]
    : { createdAt: "desc" as const };

  if (bucket === "MIXED" && !forLibrary && !chronological) {
    const words = await prisma.word.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const forgotten = words.filter((w) => w.bucket === "FORGOTTEN");
    const toStudy = words.filter((w) => w.bucket === "TO_STUDY");
    const known = words.filter((w) => w.bucket === "KNOWN");

    return orderMixedDeck({ forgotten, toStudy, known }).map(wordToClient);
  }

  const whereBucket =
    bucket === "KNOWN" || bucket === "TO_STUDY" || bucket === "FORGOTTEN"
      ? bucket
      : null;

  const words = await prisma.word.findMany({
    where: {
      userId,
      ...(bucket === "MIXED" || !whereBucket ? {} : { bucket: whereBucket }),
    },
    orderBy,
  });

  return words.map(wordToClient);
}
