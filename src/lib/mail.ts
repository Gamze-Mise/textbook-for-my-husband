import nodemailer from "nodemailer";
import { env } from "@/lib/env";

export async function sendVerificationEmail(args: {
  to: string;
  verifyUrl: string;
}) {
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
    subject: "Flashcards: verify your email",
    text: `Finish creating your account: ${args.verifyUrl}`,
    html: `
      <p>Finish creating your account:</p>
      <p><a href="${args.verifyUrl}">${args.verifyUrl}</a></p>
    `,
  });
}

