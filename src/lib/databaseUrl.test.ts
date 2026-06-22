import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeDatabaseUrl } from "./databaseUrl";

describe("normalizeDatabaseUrl", () => {
  it("upgrades sslmode=require to verify-full", () => {
    const input =
      "postgresql://user:pass@host/db?sslmode=require&channel_binding=require";
    const out = normalizeDatabaseUrl(input);
    assert.ok(out.includes("sslmode=verify-full"));
    assert.ok(!out.includes("sslmode=require"));
  });

  it("leaves verify-full unchanged", () => {
    const input = "postgresql://user:pass@host/db?sslmode=verify-full";
    assert.equal(normalizeDatabaseUrl(input), input);
  });
});
