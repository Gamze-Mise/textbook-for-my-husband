import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { sha256Hex } from "@/lib/tokens";

const bodySchema = z.object({
  email: z.string().email(),
  token: z.string().min(10),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const tokenHash = sha256Hex(`${parsed.data.token}:${env.NEXTAUTH_SECRET}`);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }

  const pending = await prisma.pendingSignup.findUnique({ where: { email } });
  if (!pending) {
    return NextResponse.json(
      { error: "Verification request not found." },
      { status: 404 },
    );
  }

  if (pending.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "This link has expired." }, { status: 410 });
  }

  if (pending.tokenHash !== tokenHash) {
    return NextResponse.json({ error: "Invalid verification link." }, { status: 401 });
  }

  await prisma.$transaction([
    prisma.user.create({
      data: {
        email,
        passwordHash: pending.passwordHash,
        emailVerifiedAt: new Date(),
      },
    }),
    prisma.pendingSignup.delete({ where: { email } }),
  ]);

  return NextResponse.json({ ok: true });
}

