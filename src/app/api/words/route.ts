import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  cloudinaryExampleAudioFolder,
  cloudinaryWordAudioFolder,
  cloudinaryWordImageFolder,
  normalizeStoredPublicId,
} from "@/lib/cloudinaryAsset";
import { orderMixedDeck } from "@/lib/mixedDeckOrder";
import { wordToClient } from "@/lib/wordSerialize";

const createSchema = z.object({
  term: z.string().min(1).max(64),
  meaning: z.string().min(1).max(400),
  example: z.string().max(600).optional(),
  bucket: z.enum(["KNOWN", "TO_STUDY", "FORGOTTEN"]).optional(),
  audioPublicId: z.string().optional(),
  exampleAudioPublicId: z.string().optional(),
  imagePublicId: z.string().optional(),
  imageFocusX: z.number().int().min(0).max(100).optional(),
  imageFocusY: z.number().int().min(0).max(100).optional(),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = Number(userId);
  if (!Number.isFinite(uid)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const bucket = searchParams.get("bucket");
  /** Dashboard library: stable order (newest first). Study mode omits this and keeps MIXED shuffled. */
  const forLibrary =
    searchParams.get("library") === "1" || searchParams.get("library") === "true";

  if (bucket === "MIXED" && !forLibrary) {
    const words = await prisma.word.findMany({
      where: { userId: uid },
      orderBy: { createdAt: "desc" },
    });

    const forgotten = words.filter((w) => w.bucket === "FORGOTTEN");
    const toStudy = words.filter((w) => w.bucket === "TO_STUDY");
    const known = words.filter((w) => w.bucket === "KNOWN");

    const mixed = orderMixedDeck({ forgotten, toStudy, known });
    return NextResponse.json({
      ok: true,
      words: mixed.map(wordToClient),
    });
  }

  const whereBucket =
    bucket === "KNOWN" || bucket === "TO_STUDY" || bucket === "FORGOTTEN"
      ? bucket
      : null;

  const words = await prisma.word.findMany({
    where: {
      userId: uid,
      ...(bucket === "MIXED" || !whereBucket
        ? {}
        : { bucket: whereBucket }),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ok: true, words: words.map(wordToClient) });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = Number(userId);
  if (!Number.isFinite(uid)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form." }, { status: 400 });
  }

  const term = parsed.data.term.trim();
  const meaning = parsed.data.meaning.trim();
  const example = parsed.data.example?.trim() || null;

  const wordAudioFolder = cloudinaryWordAudioFolder(uid);
  const exampleAudioFolder = cloudinaryExampleAudioFolder(uid);
  const imageFolder = cloudinaryWordImageFolder(uid);

  try {
    const word = await prisma.word.create({
      data: {
        userId: uid,
        term,
        meaning,
        example,
        bucket: parsed.data.bucket ?? "FORGOTTEN",
        audioPublicId: normalizeStoredPublicId(
          parsed.data.audioPublicId,
          wordAudioFolder,
        ),
        exampleAudioPublicId: normalizeStoredPublicId(
          parsed.data.exampleAudioPublicId,
          exampleAudioFolder,
        ),
        imagePublicId: normalizeStoredPublicId(
          parsed.data.imagePublicId,
          imageFolder,
        ),
        imageFocusX: parsed.data.imagePublicId
          ? (parsed.data.imageFocusX ?? null)
          : null,
        imageFocusY: parsed.data.imagePublicId
          ? (parsed.data.imageFocusY ?? null)
          : null,
      },
    });
    return NextResponse.json({ ok: true, word: wordToClient(word) });
  } catch {
    return NextResponse.json(
      { error: "This word already exists." },
      { status: 409 },
    );
  }
}
