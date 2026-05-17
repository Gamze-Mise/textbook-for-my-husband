import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  queueCloudinaryAssetReplace,
  type CloudinaryAssetDeleteJob,
} from "./cloudinaryDeleteQueue";

describe("queueCloudinaryAssetReplace", () => {
  const folder = "textbook/audi/word/2";

  it("queues when asset is replaced", () => {
    const jobs: CloudinaryAssetDeleteJob[] = [];
    queueCloudinaryAssetReplace(jobs, {
      previous: "old-clip",
      next: "new-clip",
      folder,
      resourceType: "video",
    });
    assert.equal(jobs.length, 1);
    assert.equal(jobs[0]?.stored, "old-clip");
  });

  it("queues when asset is cleared", () => {
    const jobs: CloudinaryAssetDeleteJob[] = [];
    queueCloudinaryAssetReplace(jobs, {
      previous: "old-clip",
      next: null,
      folder,
      resourceType: "video",
    });
    assert.equal(jobs.length, 1);
  });

  it("skips when unchanged or no previous asset", () => {
    const jobs: CloudinaryAssetDeleteJob[] = [];
    queueCloudinaryAssetReplace(jobs, {
      previous: "same",
      next: "same",
      folder,
      resourceType: "video",
    });
    queueCloudinaryAssetReplace(jobs, {
      previous: null,
      next: "new",
      folder,
      resourceType: "video",
    });
    assert.equal(jobs.length, 0);
  });
});
