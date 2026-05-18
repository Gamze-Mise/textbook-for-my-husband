import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AUTH_LINK_EXPIRY_MINUTES } from "@/lib/linkExpiry";
import {
  buildPasswordResetEmail,
  buildVerificationEmail,
} from "@/lib/email/templates";

describe("email templates", () => {
  const verifyUrl =
    "http://localhost:3000/verify?email=test%40example.com&token=abc123";
  const resetUrl =
    "http://localhost:3000/reset-password?email=test%40example.com&token=xyz";

  it("verification email includes action URL and expiry copy", () => {
    const { html, text, subject } = buildVerificationEmail(verifyUrl);

    assert.match(subject, /Verify your email/);
    assert.ok(html.includes(verifyUrl.replace(/&/g, "&amp;")));
    assert.match(text, /verify\?email=test%40example\.com&token=abc123/);
    assert.match(html, new RegExp(`${AUTH_LINK_EXPIRY_MINUTES} minutes`));
    assert.match(text, new RegExp(`${AUTH_LINK_EXPIRY_MINUTES} minutes`));
    assert.match(html, /Verify email address/);
    assert.doesNotMatch(html, /<motion|<\/motion>/);
  });

  it("password reset email includes action URL and expiry copy", () => {
    const { html, text, subject } = buildPasswordResetEmail(resetUrl);

    assert.match(subject, /Reset your password/);
    assert.ok(html.includes(resetUrl.replace(/&/g, "&amp;")));
    assert.match(text, /reset-password\?email=test%40example\.com&token=xyz/);
    assert.match(html, new RegExp(`${AUTH_LINK_EXPIRY_MINUTES} minutes`));
    assert.match(html, /Reset password/);
  });

  it("escapes HTML in URLs for attribute safety", () => {
    const tricky =
      'http://localhost/verify?email=a&b=c"><script>alert(1)</script>';
    const { html } = buildVerificationEmail(tricky);
    assert.doesNotMatch(html, /<script>/);
    assert.match(html, /&amp;b=c/);
  });
});
