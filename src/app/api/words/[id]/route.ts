import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { wordToClient } from "@/lib/wordSerialize";

function sameNullableString(
  a: string | null | undefined,
  b: string | null | undefined,
) {
  return (a ?? null) === (b ?? null);
}

const patchSchema = z.object({
  bucket: z.enum(["KNOWN", "TO_STUDY", "FORGOTTEN"]).optional(),
  term: z.string().min(1).max(64).optional(),
  meaning: z.string().min(1).max(400).optional(),
  example: z.string().max(600).nullable().optional(),
  audioPublicId: z.string().nullable().optional(),
  exampleAudioPublicId: z.string().nullable().optional(),
  imagePublicId: z.string().nullable().optional(),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const wordId = Number(id);
  if (!Number.isFinite(wordId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const word = await prisma.word.findFirst({
    where: { id: wordId, userId: Number(userId) },
  });
  if (!word) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const p = parsed.data;
    const data: Prisma.WordUncheckedUpdateInput = {};

    if (p.bucket !== undefined && p.bucket !== word.bucket) {
      data.bucket = p.bucket;
    }
    if (p.term !== undefined) {
      const next = p.term.trim();
      if (next !== word.term) data.term = next;
    }
    if (p.meaning !== undefined) {
      const next = p.meaning.trim();
      if (next !== word.meaning) data.meaning = next;
    }
    if (p.example !== undefined) {
      const next = p.example?.trim() || null;
      if (next !== word.example) data.example = next;
    }
    if (p.audioPublicId !== undefined) {
      if (!sameNullableString(p.audioPublicId, word.audioPublicId)) {
        data.audioPublicId = p.audioPublicId;
      }
    }
    if (p.exampleAudioPublicId !== undefined) {
      if (!sameNullableString(p.exampleAudioPublicId, word.exampleAudioPublicId)) {
        data.exampleAudioPublicId = p.exampleAudioPublicId;
      }
    }
    if (p.imagePublicId !== undefined) {
      if (!sameNullableString(p.imagePublicId, word.imagePublicId)) {
        data.imagePublicId = p.imagePublicId;
      }
    }

    const updated =
      Object.keys(data).length > 0
        ? await prisma.word.update({ where: { id: wordId }, data })
        : word;

    return NextResponse.json({ ok: true, word: wordToClient(updated) });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json(
        { error: "Could not update (duplicate word?)." },
        { status: 409 },
      );
    }
    console.error("[PATCH /api/words/:id]", e);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development" && e instanceof Error
            ? e.message
            : "Could not update.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const wordId = Number(id);
  if (!Number.isFinite(wordId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const word = await prisma.word.findFirst({
    where: { id: wordId, userId: Number(userId) },
  });
  if (!word) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.word.delete({ where: { id: wordId } });
  return NextResponse.json({ ok: true });
}

