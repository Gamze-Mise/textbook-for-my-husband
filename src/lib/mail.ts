import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { APP_NAME } from "@/lib/email/constants";
import {
  buildPasswordResetEmail,
  buildVerificationEmail,
} from "@/lib/email/templates";
import { env } from "@/lib/env";

function assertSmtpConfigured(): void {
  if (
    !env.SMTP_HOST ||
    !env.SMTP_PORT ||
    env.SMTP_SECURE === undefined ||
    !env.SMTP_USER ||
    !env.SMTP_PASS
  ) {
    throw new Error(
      "Email service is not configured. Set SMTP_* environment variables.",
    );
  }
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  assertSmtpConfigured();
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

function mailFrom(): string {
  return `"${APP_NAME}" <${env.SMTP_USER}>`;
}

async function sendTransactionalEmail(args: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  await getTransporter().sendMail({
    from: mailFrom(),
    to: args.to,
    subject: args.subject,
    text: args.text,
    html: args.html,
  });
}

export async function sendVerificationEmail(args: {
  to: string;
  verifyUrl: string;
}): Promise<void> {
  const { html, text, subject } = buildVerificationEmail(args.verifyUrl);
  await sendTransactionalEmail({
    to: args.to,
    subject,
    text,
    html,
  });
}

export async function sendPasswordResetEmail(args: {
  to: string;
  resetUrl: string;
}): Promise<void> {
  const { html, text, subject } = buildPasswordResetEmail(args.resetUrl);
  await sendTransactionalEmail({
    to: args.to,
    subject,
    text,
    html,
  });
}
