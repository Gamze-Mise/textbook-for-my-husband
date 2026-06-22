import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  APP_ROUTES,
  PREVIEW_ROUTES,
  quizApiPath,
  routesForMode,
  wordsApiPath,
} from "./paths";

describe("preview paths", () => {
  it("maps app and preview routes", () => {
    assert.deepEqual(routesForMode("app"), APP_ROUTES);
    assert.deepEqual(routesForMode("preview"), PREVIEW_ROUTES);
  });

  it("maps read-only API paths in preview mode", () => {
    assert.equal(wordsApiPath("app"), "/api/words");
    assert.equal(wordsApiPath("preview"), "/api/preview/words");
    assert.equal(quizApiPath("app"), "/api/quiz");
    assert.equal(quizApiPath("preview"), "/api/preview/quiz");
  });
});
