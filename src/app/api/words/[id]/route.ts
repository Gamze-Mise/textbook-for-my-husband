import { Prisma } from "@prisma/client";
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
import {
  deleteCloudinaryAsset,
  deleteCloudinaryAssetByPublicId,
  deleteWordCloudinaryAssets,
  queueCloudinaryAssetReplace,
  queueCloudinaryImageReplace,
  type CloudinaryAssetDeleteJob,
  type CloudinaryResolvedDeleteJob,
} from "@/lib/deleteCloudinaryAsset";
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
  imageFocusX: z.number().int().min(0).max(100).nullable().optional(),
  imageFocusY: z.number().int().min(0).max(100).nullable().optional(),
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

  const wordAudioFolder = cloudinaryWordAudioFolder(word.userId);
  const exampleAudioFolder = cloudinaryExampleAudioFolder(word.userId);
  const imageFolder = cloudinaryWordImageFolder(word.userId);

  try {
    const p = parsed.data;
    const data: Prisma.WordUncheckedUpdateInput = {};
    const cloudinaryDeletes: CloudinaryAssetDeleteJob[] = [];
    const cloudinaryImageDeletes: CloudinaryResolvedDeleteJob[] = [];

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
      const next = normalizeStoredPublicId(p.audioPublicId, wordAudioFolder);
      queueCloudinaryAssetReplace(cloudinaryDeletes, {
        previous: word.audioPublicId,
        next,
        folder: wordAudioFolder,
        resourceType: "video",
      });
      if (!sameNullableString(next, word.audioPublicId)) {
        data.audioPublicId = next;
      }
    }
    if (p.exampleAudioPublicId !== undefined) {
      const next = normalizeStoredPublicId(p.exampleAudioPublicId, exampleAudioFolder);
      queueCloudinaryAssetReplace(cloudinaryDeletes, {
        previous: word.exampleAudioPublicId,
        next,
        folder: exampleAudioFolder,
        resourceType: "video",
      });
      if (!sameNullableString(next, word.exampleAudioPublicId)) {
        data.exampleAudioPublicId = next;
      }
    }
    if (p.imagePublicId !== undefined) {
      const next = normalizeStoredPublicId(p.imagePublicId, imageFolder);
      queueCloudinaryImageReplace(cloudinaryImageDeletes, {
        previous: word.imagePublicId,
        next,
        userId: word.userId,
      });
      if (!sameNullableString(next, word.imagePublicId)) {
        data.imagePublicId = next;
        if (p.imagePublicId === null) {
          data.imageFocusX = null;
          data.imageFocusY = null;
        }
      }
    }
    if (p.imageFocusX !== undefined) {
      const next = p.imageFocusX;
      if (next !== word.imageFocusX) data.imageFocusX = next;
    }
    if (p.imageFocusY !== undefined) {
      const next = p.imageFocusY;
      if (next !== word.imageFocusY) data.imageFocusY = next;
    }

    const updated =
      Object.keys(data).length > 0
        ? await prisma.word.update({ where: { id: wordId }, data })
        : word;

    if (cloudinaryDeletes.length > 0 || cloudinaryImageDeletes.length > 0) {
      await Promise.allSettled([
        ...cloudinaryDeletes.map((job) => deleteCloudinaryAsset(job)),
        ...cloudinaryImageDeletes.map((job) =>
          deleteCloudinaryAssetByPublicId(job.publicId, job.resourceType),
        ),
      ]);
    }

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
  await deleteWordCloudinaryAssets(word);
  return NextResponse.json({ ok: true });
}

