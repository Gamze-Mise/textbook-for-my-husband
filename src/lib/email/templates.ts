import { AUTH_LINK_EXPIRY_MINUTES } from "@/lib/linkExpiry";
import { APP_NAME } from "@/lib/email/constants";
import {
  renderCtaButton,
  renderDivider,
  renderFallbackLink,
  renderHeading,
  renderInfoBox,
  renderParagraph,
} from "@/lib/email/components";
import { renderEmailLayout } from "@/lib/email/layout";

function buildActionEmail(args: {
  preheader: string;
  title: string;
  heading: string;
  intro: string;
  ctaLabel: string;
  actionUrl: string;
  securityLine: string;
  footerNote: string;
}): { html: string; text: string } {
  const bodyHtml = `
    ${renderHeading(args.heading)}
    ${renderParagraph(args.intro)}
    ${renderCtaButton(args.ctaLabel, args.actionUrl)}
    ${renderFallbackLink(args.actionUrl)}
    ${renderDivider()}
    ${renderInfoBox([
      `This link expires in ${AUTH_LINK_EXPIRY_MINUTES} minutes.`,
      args.securityLine,
    ])}
  `;

  const html = renderEmailLayout({
    preheader: args.preheader,
    title: args.title,
    bodyHtml,
    footerNote: args.footerNote,
  });

  const text = [
    args.heading,
    "",
    args.intro,
    "",
    `${args.ctaLabel}: ${args.actionUrl}`,
    "",
    `This link expires in ${AUTH_LINK_EXPIRY_MINUTES} minutes.`,
    args.securityLine,
    "",
    args.footerNote,
  ].join("\n");

  return { html, text };
}

export function buildVerificationEmail(verifyUrl: string): {
  html: string;
  text: string;
  subject: string;
} {
  const { html, text } = buildActionEmail({
    preheader: "Confirm your email to finish creating your Vocabulary account.",
    title: `Verify your email · ${APP_NAME}`,
    heading: "Confirm your email",
    intro:
      "You're one step away from your personal vocabulary library. Tap the button below to verify your email and finish creating your account.",
    ctaLabel: "Verify email address",
    actionUrl: verifyUrl,
    securityLine:
      "If you didn't create an account, you can safely ignore this message.",
    footerNote: `This message was sent by ${APP_NAME} for email verification.`,
  });

  return {
    html,
    text,
    subject: `Verify your email · ${APP_NAME}`,
  };
}

export function buildPasswordResetEmail(resetUrl: string): {
  html: string;
  text: string;
  subject: string;
} {
  const { html, text } = buildActionEmail({
    preheader: "Reset your Vocabulary password with the secure link inside.",
    title: `Reset your password · ${APP_NAME}`,
    heading: "Reset your password",
    intro:
      "We received a request to reset the password for your account. Use the button below to choose a new password.",
    ctaLabel: "Reset password",
    actionUrl: resetUrl,
    securityLine:
      "If you didn't request a reset, no action is needed — your password will stay the same.",
    footerNote: `This message was sent by ${APP_NAME} for password recovery.`,
  });

  return {
    html,
    text,
    subject: `Reset your password · ${APP_NAME}`,
  };
}
