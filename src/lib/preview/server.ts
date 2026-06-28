import { NextResponse } from "next/server";
import { getPreviewUserId } from "@/lib/preview/userId";

function previewUnavailableResponse() {
  return NextResponse.json({ error: "Preview is not available." }, { status: 404 });
}

/** Returns preview deck owner id, or a 404 response when preview is disabled. */
export function requirePreviewUserId(): number | NextResponse {
  const userId = getPreviewUserId();
  return userId ?? previewUnavailableResponse();
}

export function isPreviewUserId(
  value: number | NextResponse,
): value is number {
  return typeof value === "number";
}
