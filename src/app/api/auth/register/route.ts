import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { newToken, sha256Hex } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid form." },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return NextResponse.json(
      { error: "This email is already registered. Please sign in." },
      { status: 409 },
    );
  }

  const token = newToken(32);
  const tokenHash = sha256Hex(`${token}:${env.NEXTAUTH_SECRET}`);
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.pendingSignup.upsert({
    where: { email: normalizedEmail },
    create: {
      email: normalizedEmail,
      passwordHash,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
    update: {
      passwordHash,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });

  const verifyUrl = `${env.NEXTAUTH_URL}/verify?email=${encodeURIComponent(
    normalizedEmail,
  )}&token=${encodeURIComponent(token)}`;

  await sendVerificationEmail({ to: normalizedEmail, verifyUrl });

  return NextResponse.json({ ok: true });
}

