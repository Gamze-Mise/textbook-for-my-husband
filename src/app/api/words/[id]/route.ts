import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  bucket: z.enum(["KNOWN", "TO_STUDY", "FORGOTTEN"]).optional(),
  term: z.string().min(1).max(64).optional(),
  meaning: z.string().min(1).max(400).optional(),
  example: z.string().max(600).nullable().optional(),
  audioUrl: z.string().url().nullable().optional(),
  audioPublicId: z.string().nullable().optional(),
  exampleAudioUrl: z.string().url().nullable().optional(),
  exampleAudioPublicId: z.string().nullable().optional(),
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
    const updated = await prisma.word.update({
      where: { id: wordId },
      data: {
        ...(parsed.data.bucket ? { bucket: parsed.data.bucket } : {}),
        ...(parsed.data.term !== undefined ? { term: parsed.data.term.trim() } : {}),
        ...(parsed.data.meaning !== undefined
          ? { meaning: parsed.data.meaning.trim() }
          : {}),
        ...(parsed.data.example !== undefined
          ? { example: parsed.data.example?.trim() || null }
          : {}),
        ...(parsed.data.audioUrl !== undefined ? { audioUrl: parsed.data.audioUrl } : {}),
        ...(parsed.data.audioPublicId !== undefined
          ? { audioPublicId: parsed.data.audioPublicId }
          : {}),
        ...(parsed.data.exampleAudioUrl !== undefined
          ? { exampleAudioUrl: parsed.data.exampleAudioUrl }
          : {}),
        ...(parsed.data.exampleAudioPublicId !== undefined
          ? { exampleAudioPublicId: parsed.data.exampleAudioPublicId }
          : {}),
      },
    });

    return NextResponse.json({ ok: true, word: updated });
  } catch {
    return NextResponse.json(
      { error: "Could not update (duplicate word?)." },
      { status: 409 },
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

