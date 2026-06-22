import type { AppMode } from "@/types/appMode";

export const APP_ROUTES = {
  library: "/app",
  study: "/app/study",
  quiz: "/app/quiz",
} as const;

export const PREVIEW_ROUTES = {
  library: "/preview",
  study: "/preview/study",
  quiz: "/preview/quiz",
} as const;

export function routesForMode(mode: AppMode) {
  return mode === "preview" ? PREVIEW_ROUTES : APP_ROUTES;
}

export function wordsApiPath(mode: AppMode) {
  return mode === "preview" ? "/api/preview/words" : "/api/words";
}

export function quizApiPath(mode: AppMode) {
  return mode === "preview" ? "/api/preview/quiz" : "/api/quiz";
}
