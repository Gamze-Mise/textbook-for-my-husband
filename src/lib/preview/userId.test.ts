import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  PREVIEW_DECK_USER_ID,
  getPreviewUserId,
  isPreviewEnabled,
} from "./userId";

describe("preview userId", () => {
  const original = process.env.PREVIEW_USER_ID;

  afterEach(() => {
    if (original === undefined) delete process.env.PREVIEW_USER_ID;
    else process.env.PREVIEW_USER_ID = original;
  });

  beforeEach(() => {
    delete process.env.PREVIEW_USER_ID;
  });

  it("uses deck user #2 when preview is enabled", () => {
    process.env.PREVIEW_USER_ID = "2";
    assert.equal(isPreviewEnabled(), true);
    assert.equal(getPreviewUserId(), PREVIEW_DECK_USER_ID);
    assert.equal(getPreviewUserId(), 2);
  });

  it("treats any non-disabled env value as enabled", () => {
    process.env.PREVIEW_USER_ID = "true";
    assert.equal(isPreviewEnabled(), true);
    assert.equal(getPreviewUserId(), 2);
  });

  it("is disabled when env is missing or explicitly off", () => {
    assert.equal(isPreviewEnabled(), false);
    assert.equal(getPreviewUserId(), null);

    process.env.PREVIEW_USER_ID = "0";
    assert.equal(isPreviewEnabled(), false);
    assert.equal(getPreviewUserId(), null);
  });
});
