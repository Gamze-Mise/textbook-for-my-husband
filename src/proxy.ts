import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const isPreview =
    pathname.startsWith("/preview") || pathname.startsWith("/api/preview");

  if (isPreview) return NextResponse.next();

  const isProtected =
    pathname.startsWith("/app") ||
    pathname.startsWith("/api/words") ||
    pathname.startsWith("/api/quiz") ||
    pathname.startsWith("/api/audio");

  if (!isProtected) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("callbackUrl", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/preview/:path*",
    "/api/preview/:path*",
    "/app/:path*",
    "/api/words/:path*",
    "/api/quiz",
    "/api/quiz/:path*",
    "/api/audio/:path*",
  ],
};
