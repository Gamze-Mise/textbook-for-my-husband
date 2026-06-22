import { NextResponse } from "next/server";
import { loadUserWords } from "@/lib/loadUserWords";
import { isPreviewUserId, requirePreviewUserId } from "@/lib/preview/server";

export async function GET(req: Request) {
  const userId = requirePreviewUserId();
  if (!isPreviewUserId(userId)) return userId;

  const { searchParams } = new URL(req.url);
  const bucket = searchParams.get("bucket");
  const forLibrary =
    searchParams.get("library") === "1" || searchParams.get("library") === "true";

  const words = await loadUserWords({
    userId,
    bucket,
    forLibrary,
    sortOrder: "oldest",
  });
  return NextResponse.json({ ok: true, words });
}
