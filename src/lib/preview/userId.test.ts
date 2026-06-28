import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  PREVIEW_DECK_USER_ID,
  PREVIEW_ROUTES_LIVE,
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

  it("enables preview when PREVIEW_ROUTES_LIVE and env are set", () => {
    assert.equal(PREVIEW_ROUTES_LIVE, true);
    process.env.PREVIEW_USER_ID = "1";
    assert.equal(isPreviewEnabled(), true);
    assert.equal(getPreviewUserId(), PREVIEW_DECK_USER_ID);
    assert.equal(getPreviewUserId(), 1);
  });

  it("is disabled when env is missing or explicitly off", () => {
    assert.equal(isPreviewEnabled(), false);
    assert.equal(getPreviewUserId(), null);

    process.env.PREVIEW_USER_ID = "0";
    assert.equal(isPreviewEnabled(), false);
    assert.equal(getPreviewUserId(), null);
  });

  it("uses deck user #1", () => {
    assert.equal(PREVIEW_DECK_USER_ID, 1);
  });
});
