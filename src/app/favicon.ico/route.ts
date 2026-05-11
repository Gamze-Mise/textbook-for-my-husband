import { NextResponse } from "next/server";

export function GET(req: Request) {
  // Browsers often request /favicon.ico explicitly.
  // We redirect it to our PNG icon to avoid Next's default dev icon.
  return NextResponse.redirect(new URL("/favicon.png", req.url), 307);
}

