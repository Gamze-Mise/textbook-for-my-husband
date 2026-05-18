import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { orderMixedDeck } from "@/lib/mixedDeckOrder";

describe("orderMixedDeck", () => {
  it("includes every word exactly once", () => {
    const forgotten = [{ id: "f1" }, { id: "f2" }];
    const toStudy = [{ id: "t1" }];
    const known = [{ id: "k1" }, { id: "k2" }];

    const ordered = orderMixedDeck({ forgotten, toStudy, known });
    const ids = ordered.map((w) => w.id).sort();

    assert.deepEqual(ids, ["f1", "f2", "k1", "k2", "t1"]);
  });

  it("places unknown buckets before known when lists are separated", () => {
    const forgotten = [{ id: "f1" }];
    const toStudy = [{ id: "t1" }];
    const known = Array.from({ length: 20 }, (_, i) => ({ id: `k${i}` }));

    const ordered = orderMixedDeck({ forgotten, toStudy, known });
    const firstKnown = ordered.findIndex((w) => w.id.startsWith("k"));

    assert.ok(firstKnown >= 2);
    assert.equal(ordered[0].id, "f1");
    assert.equal(ordered[1].id, "t1");
  });
});
