import { NextResponse } from "next/server";
import { z } from "zod";
import { AUTH_LINK_EXPIRY_MS } from "@/lib/linkExpiry";
import { env } from "@/lib/env";
import { sendPasswordResetEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { newToken, sha256Hex } from "@/lib/tokens";

const bodySchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid form." }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });
    // Always return ok to avoid account enumeration
    if (!user) return NextResponse.json({ ok: true });

    const token = newToken(32);
    const tokenHash = sha256Hex(`${token}:${env.NEXTAUTH_SECRET}`);

    await prisma.passwordReset.create({
      data: {
        email,
        tokenHash,
        expiresAt: new Date(Date.now() + AUTH_LINK_EXPIRY_MS),
      },
    });

    const resetUrl = `${env.NEXTAUTH_URL}/reset-password?email=${encodeURIComponent(
      email,
    )}&token=${encodeURIComponent(token)}`;

    await sendPasswordResetEmail({ to: email, resetUrl });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("forgot_password_failed", e);
    const msg = e instanceof Error ? e.message : "Something went wrong.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
