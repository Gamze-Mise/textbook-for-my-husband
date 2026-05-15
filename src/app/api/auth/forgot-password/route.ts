import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { newToken, sha256Hex } from "@/lib/tokens";
import nodemailer from "nodemailer";

const bodySchema = z.object({
  email: z.string().email(),
});

async function sendResetEmail(args: { to: string; resetUrl: string }) {
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: env.SMTP_USER,
    to: args.to,
    subject: "Vocabulary: reset your password",
    text: `Reset your password: ${args.resetUrl}`,
    html: `
      <p>Reset your password:</p>
      <p><a href="${args.resetUrl}">${args.resetUrl}</a></p>
    `,
  });
}

export async function POST(req: Request) {
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
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });

  const resetUrl = `${env.NEXTAUTH_URL}/reset-password?email=${encodeURIComponent(
    email,
  )}&token=${encodeURIComponent(token)}`;

  await sendResetEmail({ to: email, resetUrl });

  return NextResponse.json({ ok: true });
}

