import { EMAIL_COLORS } from "@/lib/email/constants";
import { escapeHtml } from "@/lib/email/escape";

export function renderHeading(text: string): string {
  return `<h1 style="margin:0 0 12px;font-size:22px;font-weight:700;letter-spacing:-0.02em;line-height:1.3;color:${EMAIL_COLORS.text};">${escapeHtml(text)}</h1>`;
}

export function renderParagraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${EMAIL_COLORS.textMuted};">${escapeHtml(text)}</p>`;
}

export function renderCtaButton(label: string, href: string): string {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 24px;">
  <tr>
    <td align="center" style="border-radius:12px;background-color:${EMAIL_COLORS.accent};">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${safeHref}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="25%" strokecolor="${EMAIL_COLORS.accent}" fillcolor="${EMAIL_COLORS.accent}">
        <w:anchorlock/>
        <center style="color:#ffffff;font-family:sans-serif;font-size:15px;font-weight:600;">${safeLabel}</center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-->
      <a class="email-cta" href="${safeHref}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;line-height:1.2;color:${EMAIL_COLORS.buttonText};text-decoration:none;border-radius:12px;background-color:${EMAIL_COLORS.accent};">${safeLabel}</a>
      <!--<![endif]-->
    </td>
  </tr>
</table>`;
}

export function renderFallbackLink(href: string): string {
  const safeHref = escapeHtml(href);
  return `<p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:${EMAIL_COLORS.textSubtle};">If the button doesn't work, copy and paste this link into your browser:</p>
<p style="margin:0 0 20px;font-size:12px;line-height:1.5;word-break:break-all;">
  <a href="${safeHref}" style="color:${EMAIL_COLORS.accent};text-decoration:underline;">${safeHref}</a>
</p>`;
}

export function renderInfoBox(lines: string[]): string {
  const items = lines
    .map(
      (line) =>
        `<li style="margin:0 0 6px;font-size:13px;line-height:1.5;color:${EMAIL_COLORS.textMuted};">${escapeHtml(line)}</li>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 8px;background-color:${EMAIL_COLORS.footerBg};border:1px solid ${EMAIL_COLORS.divider};border-radius:12px;">
  <tr>
    <td style="padding:16px 18px;">
      <ul style="margin:0;padding:0 0 0 18px;">${items}</ul>
    </td>
  </tr>
</table>`;
}

export function renderDivider(): string {
  return `<hr style="margin:24px 0;border:none;border-top:1px solid ${EMAIL_COLORS.divider};" />`;
}
