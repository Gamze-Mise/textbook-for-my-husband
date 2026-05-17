import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cloudinaryDeliveryPublicId,
  cloudinaryExampleAudioFolder,
  cloudinaryStoragePublicId,
  cloudinaryWordAudioFolder,
  cloudinaryWordImageDeliveryPublicId,
  cloudinaryWordImageFolder,
  normalizeStoredPublicId,
} from "./cloudinaryAsset";

describe("cloudinaryAsset", () => {
  const audioFolder = cloudinaryWordAudioFolder(2);
  const base = "hello-1779018411759";

  it("builds per-user Cloudinary folders", () => {
    assert.equal(audioFolder, "textbook/audi/word/2");
    assert.equal(cloudinaryExampleAudioFolder(2), "textbook/audi/example/2");
    assert.equal(cloudinaryWordImageFolder(2), "textbook/images/word/2");
  });

  it("stores basename only", () => {
    assert.equal(
      cloudinaryStoragePublicId(`${audioFolder}/${base}`, audioFolder),
      base,
    );
    assert.equal(cloudinaryStoragePublicId(base, audioFolder), base);
  });

  it("rebuilds delivery public_id from basename", () => {
    assert.equal(
      cloudinaryDeliveryPublicId(base, audioFolder),
      `${audioFolder}/${base}`,
    );
  });

  it("keeps legacy full paths for delivery", () => {
    const legacy = `textbook/word/2/${base}`;
    assert.equal(cloudinaryDeliveryPublicId(legacy, audioFolder), legacy);
  });

  it("resolves legacy word-images delivery path", () => {
    assert.equal(
      cloudinaryWordImageDeliveryPublicId("u2-1779007313729", 2),
      "textbook/word-images/u2-1779007313729",
    );
    assert.equal(
      cloudinaryWordImageDeliveryPublicId("img-1", 2),
      "textbook/images/word/2/img-1",
    );
  });

  it("normalizes nullable values for DB", () => {
    assert.equal(normalizeStoredPublicId(null, audioFolder), null);
    assert.equal(normalizeStoredPublicId("", audioFolder), null);
    assert.equal(
      normalizeStoredPublicId(`${audioFolder}/${base}`, audioFolder),
      base,
    );
  });
});
