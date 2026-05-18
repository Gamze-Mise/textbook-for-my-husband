import { APP_NAME, APP_TAGLINE, EMAIL_COLORS } from "@/lib/email/constants";
import { escapeHtml } from "@/lib/email/escape";

export type EmailLayoutOptions = {
  preheader: string;
  title: string;
  bodyHtml: string;
  footerNote?: string;
};

export function renderEmailLayout(options: EmailLayoutOptions): string {
  const preheader = escapeHtml(options.preheader);
  const title = escapeHtml(options.title);
  const footerNote = options.footerNote
    ? escapeHtml(options.footerNote)
    : `You received this email because someone used your address with ${APP_NAME}.`;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .email-padding { padding-left: 20px !important; padding-right: 20px !important; }
      .email-cta { display: block !important; width: 100% !important; box-sizing: border-box !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${EMAIL_COLORS.pageBg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${EMAIL_COLORS.pageBg};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" class="email-container" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;width:100%;">
          <tr>
            <td style="padding-bottom:24px;text-align:center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td style="vertical-align:middle;padding-right:10px;">
                    <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#6366f1 0%,#ec4899 100%);line-height:36px;text-align:center;font-size:18px;font-weight:700;color:#ffffff;">V</div>
                  </td>
                  <td style="vertical-align:middle;text-align:left;">
                    <div style="font-size:15px;font-weight:700;letter-spacing:-0.02em;color:${EMAIL_COLORS.text};">${APP_NAME}</div>
                    <div style="font-size:12px;color:${EMAIL_COLORS.textMuted};margin-top:2px;">${APP_TAGLINE}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${EMAIL_COLORS.cardBg};border:1px solid ${EMAIL_COLORS.cardBorder};border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                <tr>
                  <td class="email-padding" style="padding:40px 40px 32px;">
                    ${options.bodyHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 8px 0;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;line-height:1.5;color:${EMAIL_COLORS.textMuted};">${footerNote}</p>
              <p style="margin:0;font-size:11px;line-height:1.5;color:${EMAIL_COLORS.textSubtle};">&copy; ${new Date().getFullYear()} ${APP_NAME}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
