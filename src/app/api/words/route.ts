import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { wordToClient } from "@/lib/wordSerialize";

const createSchema = z.object({
  term: z.string().min(1).max(64),
  meaning: z.string().min(1).max(400),
  example: z.string().max(600).optional(),
  bucket: z.enum(["KNOWN", "TO_STUDY", "FORGOTTEN"]).optional(),
  audioPublicId: z.string().optional(),
  exampleAudioPublicId: z.string().optional(),
  imagePublicId: z.string().optional(),
});

function pickMixed<T>(args: { forgotten: T[]; toStudy: T[]; known: T[] }) {
  const shuffle = <U>(arr: U[]) => [...arr].sort(() => Math.random() - 0.5);

  const forgotten = shuffle(args.forgotten);
  const toStudy = shuffle(args.toStudy);
  const known = shuffle(args.known);

  const out: T[] = [];
  // Heavily favor "unknown-ish" buckets in mixed
  const plan = [
    ...Array.from({ length: 8 }, () => "FORGOTTEN"),
    ...Array.from({ length: 3 }, () => "TO_STUDY"),
    ...Array.from({ length: 1 }, () => "KNOWN"),
  ] as const;

  while (
    out.length < 50 &&
    (forgotten.length || toStudy.length || known.length)
  ) {
    for (const p of plan) {
      if (out.length >= 50) break;
      if (p === "FORGOTTEN" && forgotten.length) out.push(forgotten.shift()!);
      else if (p === "TO_STUDY" && toStudy.length) out.push(toStudy.shift()!);
      else if (p === "KNOWN" && known.length) out.push(known.shift()!);
    }
  }
  return out;
}

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

    const mixed = pickMixed({ forgotten, toStudy, known });
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

  try {
    const word = await prisma.word.create({
      data: {
        userId: uid,
        term,
        meaning,
        example,
        bucket: parsed.data.bucket ?? "FORGOTTEN",
        audioPublicId: parsed.data.audioPublicId,
        exampleAudioPublicId: parsed.data.exampleAudioPublicId,
        imagePublicId: parsed.data.imagePublicId,
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
