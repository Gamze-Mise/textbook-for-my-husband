import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { sha256Hex } from "@/lib/tokens";

const bodySchema = z.object({
  email: z.string().email(),
  token: z.string().min(10),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const tokenHash = sha256Hex(`${parsed.data.token}:${env.NEXTAUTH_SECRET}`);

  const reset = await prisma.passwordReset.findFirst({
    where: { email, tokenHash },
    orderBy: { createdAt: "desc" },
  });
  if (!reset) {
    return NextResponse.json({ error: "Invalid reset link." }, { status: 401 });
  }

  if (reset.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "This link has expired." }, { status: 410 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid reset link." }, { status: 401 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { email }, data: { passwordHash } }),
    prisma.passwordReset.deleteMany({ where: { email } }),
  ]);

  return NextResponse.json({ ok: true });
}

