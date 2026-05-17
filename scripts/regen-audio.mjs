/**
 * Regenerate word audio using local Google Translate (home IP) and upload to Cloudinary.
 * Use when production (Vercel) audio sounds wrong.
 *
 *   DATABASE_URL="..." CLOUDINARY_*=... node scripts/regen-audio.mjs
 *   DATABASE_URL="..." CLOUDINARY_*=... node scripts/regen-audio.mjs multi
 */
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

const TRANSLATE_HOST = "https://translate.google.com";
const termFilter = process.argv[2]?.trim().toLowerCase();

function buildUrl(text) {
  const p = new URLSearchParams({
    ie: "UTF-8",
    q: text.trim(),
    tl: "en",
    client: "tw-ob",
    ttsspeed: "1",
  });
  return `${TRANSLATE_HOST}/translate_tts?${p}`;
}

async function fetchTranslateMp3(text) {
  const res = await fetch(buildUrl(text), {
    headers: {
      Referer: `${TRANSLATE_HOST}/`,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });
  if (!res.ok) throw new Error(`Translate ${res.status} for "${text}"`);
  return Buffer.from(await res.arrayBuffer());
}

function uploadMp3(buffer, term) {
  const safe = term.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
  const publicId = `${safe}-${Date.now()}`;
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "textbook/audio/word",
        public_id: publicId,
        overwrite: true,
      },
      (err, result) => {
        if (err || !result) reject(err ?? new Error("upload failed"));
        else resolve(result.public_id);
      },
    );
    stream.end(buffer);
  });
}

async function main() {
  const { DATABASE_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;
  if (!DATABASE_URL || !CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.error("Set DATABASE_URL and CLOUDINARY_* env vars.");
    process.exit(1);
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  const prisma = new PrismaClient();
  const words = await prisma.word.findMany({
    where: termFilter ? { term: { equals: termFilter, mode: "insensitive" } } : {},
    select: { id: true, term: true },
  });

  console.log(`Regenerating ${words.length} word(s)...`);

  for (const w of words) {
    const term = w.term.trim();
    if (!term) continue;
    try {
      const buf = await fetchTranslateMp3(term);
      const publicId = await uploadMp3(buf, term);
      await prisma.word.update({
        where: { id: w.id },
        data: { audioPublicId: publicId },
      });
      console.log(`OK  ${term} → ${publicId}`);
    } catch (e) {
      console.error(`FAIL ${term}:`, e instanceof Error ? e.message : e);
    }
  }

  await prisma.$disconnect();
}

main();
