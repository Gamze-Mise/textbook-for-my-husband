"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AppNavLink from "@/components/app/AppNavLink";
import AppPageHeader from "@/components/app/AppPageHeader";
import AppAccountMenu from "@/components/app/AppAccountMenu";
import AlertBanner from "@/components/app/AlertBanner";
import WordImage from "@/components/WordImage";
import { tabPillActive, tabPillIdle } from "@/components/ui/buttonClasses";
import { requestAudioTts } from "@/lib/requestAudioTts";
import { type DeckTab, type WordCard, STUDY_DECK_TABS, deckTabLabel } from "@/types/word";

/** Rotating block: one physical “card” slab (both faces + actions). */
const CARD_FLIP_H =
  "relative h-[32rem] w-full max-h-[calc(100dvh-10rem)] sm:h-[34rem]";

const MAIN_SLOT =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]";
const AUDIO_SLOT =
  "flex h-14 w-full shrink-0 items-center justify-center";

const FACE_SHELL =
  "absolute inset-0 flex flex-col rounded-2xl border border-zinc-200 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-950 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)]";

export default function StudyClient() {
  const studyRootRef = useRef<HTMLDivElement | null>(null);
  const [bucket, setBucket] = useState<DeckTab>("MIXED");
  const [words, setWords] = useState<WordCard[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Example clip just generated in-session (before list reload). */
  const [exampleSrcOverride, setExampleSrcOverride] = useState<Record<string, string>>(
    {},
  );

  const current = words[idx] ?? null;
  const remaining = useMemo(
    () => (words.length ? `${idx + 1}/${words.length}` : "0/0"),
    [idx, words.length],
  );

  async function load() {
    setLoading(true);
    setError(null);
    setFlipped(false);
    setIdx(0);
    setExampleSrcOverride({});

    const res = await fetch(`/api/words?bucket=${bucket}`);
    const json = (await res.json().catch(() => null)) as
      | { ok: true; words: WordCard[] }
      | { error: string }
      | null;

    setLoading(false);

    if (!res.ok || !json || "error" in json) {
      setWords([]);
      setError(json && "error" in json ? json.error : "Failed to load cards.");
      return;
    }

    setWords(json.words);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucket]);

  const next = useCallback(() => {
    setFlipped(false);
    setIdx((v) => Math.min(v + 1, Math.max(0, words.length - 1)));
  }, [words.length]);

  const prev = useCallback(() => {
    setFlipped(false);
    setIdx((v) => Math.max(v - 1, 0));
  }, []);

  useEffect(() => {
    function refocusAfterNav() {
      requestAnimationFrame(() => {
        for (const node of document.querySelectorAll("audio")) {
          try {
            (node as HTMLAudioElement).blur();
          } catch {
            /* ignore */
          }
        }
        const ae = document.activeElement;
        if (ae instanceof HTMLElement && ae !== document.body) ae.blur();
        studyRootRef.current?.focus({ preventScroll: true });
      });
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;

      const el = e.target as HTMLElement | null;
      const tag = el?.tagName?.toLowerCase();
      const isTypingTarget =
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        Boolean(el?.isContentEditable);
      if (isTypingTarget) return;

      // Capture phase: intercept before <audio controls> shadow UI.
      e.preventDefault();
      e.stopPropagation();

      // Same intent as Next / Previous buttons (next/prev clamp idx internally).
      if (e.key === "ArrowRight") next();
      else prev();

      refocusAfterNav();
    }

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [next, prev]);

  useEffect(() => {
    if (!current) return;

    function onFlipKey(e: KeyboardEvent) {
      const container = studyRootRef.current;
      if (!container) return;
      if (e.key !== "Enter" && e.key !== " ") return;
      const el = e.target;
      if (!(el instanceof HTMLElement) || !container.contains(el)) return;
      const tag = el.tagName.toLowerCase();
      if (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        el.isContentEditable
      ) {
        return;
      }
      if (el.closest("header")) return;

      e.preventDefault();
      e.stopPropagation();
      setFlipped((v) => !v);
    }

    const attachTo = studyRootRef.current;
    if (!attachTo) return;
    attachTo.addEventListener("keydown", onFlipKey, true);
    return () => {
      attachTo.removeEventListener("keydown", onFlipKey, true);
    };
  }, [current]);

  useEffect(() => {
    if (!flipped) return;
    if (!current?.example?.trim()) return;
    if (exampleSrcOverride[current.id] || current.exampleAudioSrc) return;

    const ac = new AbortController();
    void (async () => {
      try {
        const json = await requestAudioTts({
          text: current.example!.trim(),
        });
        if (!json.ok) return;

        setExampleSrcOverride((prev) => ({
          ...prev,
          [current.id]: json.audioSrc,
        }));

        const patchRes = await fetch(`/api/words/${current.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            exampleAudioPublicId: json.audioPublicId,
          }),
          signal: ac.signal,
        });
        const patchJson = (await patchRes.json().catch(() => null)) as
          | { error: string }
          | { ok: true }
          | null;
        if (!patchRes.ok || !patchJson || "error" in patchJson) {
          setError(
            patchJson && "error" in patchJson
              ? patchJson.error
              : "Example audio could not be saved. Run `npx prisma db push` (or apply migrations) for exampleAudioPublicId.",
          );
        }
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
      }
    })();

    return () => ac.abort();
  }, [flipped, current, exampleSrcOverride]);

  function mark(nextBucket: "KNOWN" | "FORGOTTEN") {
    if (!current) return;
    setError(null);
    const id = current.id;
    const removeIndex = words.findIndex((w) => w.id === id);
    const nextWords = words.filter((w) => w.id !== id);

    void fetch(`/api/words/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bucket: nextBucket }),
    }).then((res) => {
      if (!res.ok) setError("Could not save your answer. Check your connection.");
    });

    setFlipped(false);
    setWords(nextWords);
    setIdx((oldIdx) => {
      if (nextWords.length === 0) return 0;
      if (removeIndex < oldIdx) return oldIdx - 1;
      if (removeIndex === oldIdx) return Math.min(oldIdx, nextWords.length - 1);
      return oldIdx;
    });
  }

  const actions = (
    <div className="mt-auto flex gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800/80">
      <button
        type="button"
        className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium transition active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-950"
        onClick={(e) => {
          e.stopPropagation();
          mark("KNOWN");
        }}
      >
        Got it
      </button>
      <button
        type="button"
        className="flex-1 rounded-xl bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white transition active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-950"
        onClick={(e) => {
          e.stopPropagation();
          mark("FORGOTTEN");
        }}
      >
        Again
      </button>
    </div>
  );

  return (
    <div
      ref={studyRootRef}
      tabIndex={-1}
      className="mx-auto w-full max-w-3xl p-6 outline-none focus:outline-none"
    >
      <AppPageHeader
        kicker="Study mode"
        title="Study"
        showBottomBorder={false}
        actions={
          <>
            <AppNavLink href="/app">Library</AppNavLink>
            <AppNavLink href="/app/quiz">Quiz</AppNavLink>
            <AppAccountMenu />
          </>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {STUDY_DECK_TABS.map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setBucket(b)}
            className={b === bucket ? tabPillActive : tabPillIdle}
          >
            {deckTabLabel(b)}
          </button>
        ))}
        <div className="ml-auto text-sm text-zinc-600 dark:text-zinc-400">
          {remaining}
        </div>
      </div>

      {error ? (
        <div className="mt-4">
          <AlertBanner variant="error">{error}</AlertBanner>
        </div>
      ) : null}

      <div className="mt-6">
        {loading ? (
          <div className="animate-pulse space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mx-auto aspect-16/10 max-w-md rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="mx-auto h-8 w-48 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="mx-auto h-10 max-w-xs rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ) : !current ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
            No cards in this deck.
          </div>
        ) : (
          <div
            className="mx-auto w-full max-w-xl rounded-2xl outline-none"
            tabIndex={0}
            role="group"
            aria-label={flipped ? "Card back" : "Card front"}
          >
            <div className="[perspective:1400px]">
              <div
                className={`${CARD_FLIP_H} transform-gpu transition-[transform] duration-500 ease-[cubic-bezier(0.4,0.2,0.2,1)] will-change-transform motion-reduce:transition-none motion-reduce:duration-0 [transform-style:preserve-3d]`}
                style={{
                  transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                <div
                  className={`${FACE_SHELL} ${flipped ? "pointer-events-none" : "cursor-pointer"}`}
                  inert={flipped ? true : undefined}
                  aria-hidden={flipped}
                  style={{
                    WebkitBackfaceVisibility: "hidden",
                    backfaceVisibility: "hidden",
                    transform: "rotateY(0deg) translateZ(1px)",
                  }}
                  onClick={(e) => {
                    const t = e.target as HTMLElement;
                    if (
                      t.closest("button") ||
                      t.closest("audio") ||
                      t.closest("input") ||
                      t.closest("textarea")
                    ) {
                      return;
                    }
                    setFlipped((v) => !v);
                  }}
                >
                  <div className="flex h-full min-h-0 w-full flex-col overflow-hidden p-5 sm:p-6">
                    <div
                      className={`${MAIN_SLOT} flex flex-col items-center justify-center gap-4 px-0 py-1`}
                    >
                      <div className="w-full max-w-md shrink-0 overflow-hidden rounded-2xl ring-1 ring-zinc-200/80 dark:ring-zinc-800">
                        <WordImage
                          src={current.imageSrc}
                          alt=""
                          objectPosition={current.imageObjectPosition}
                          className="aspect-16/10 w-full object-cover"
                        />
                      </div>
                      <div className="w-full shrink-0 text-center">
                        <div className="text-4xl font-semibold tracking-tight">
                          {current.term}
                        </div>
                        <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                          Tap to flip
                        </div>
                      </div>
                    </div>
                    <div className={AUDIO_SLOT}>
                      {current.playbackAudioSrc ? (
                        <audio
                          className="h-10 w-full rounded-lg outline-none focus:outline-none focus-visible:outline-none"
                          controls
                          tabIndex={-1}
                          src={current.playbackAudioSrc}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="h-10 w-full" aria-hidden />
                      )}
                    </div>
                    {actions}
                  </div>
                </div>

                <div
                  className={`${FACE_SHELL} ${!flipped ? "pointer-events-none" : "cursor-pointer"}`}
                  inert={!flipped ? true : undefined}
                  aria-hidden={!flipped}
                  style={{
                    WebkitBackfaceVisibility: "hidden",
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg) translateZ(1px)",
                  }}
                  onClick={(e) => {
                    const t = e.target as HTMLElement;
                    if (
                      t.closest("button") ||
                      t.closest("audio") ||
                      t.closest("input") ||
                      t.closest("textarea")
                    ) {
                      return;
                    }
                    setFlipped((v) => !v);
                  }}
                >
                  <div className="flex h-full min-h-0 w-full flex-col overflow-hidden p-5 sm:p-6">
                    <div className={`${MAIN_SLOT} px-0 py-1`}>
                      <div className="flex min-h-full w-full flex-col justify-center text-center">
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                              Meaning
                            </div>
                            <div className="mt-1 text-base leading-7">
                              {current.meaning}
                            </div>
                          </div>
                          {current.example ? (
                            <div>
                              <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                Example
                              </div>
                              <div className="mt-1 text-base leading-7 italic">
                                {current.example}
                              </div>
                            </div>
                          ) : (
                            <div className="min-h-14" aria-hidden />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={AUDIO_SLOT}>
                      {current.exampleAudioSrc ||
                      exampleSrcOverride[current.id] ? (
                        <audio
                          className="h-10 w-full rounded-lg outline-none focus:outline-none focus-visible:outline-none"
                          controls
                          tabIndex={-1}
                          src={
                            current.exampleAudioSrc ||
                            exampleSrcOverride[current.id] ||
                            undefined
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="h-10 w-full" aria-hidden />
                      )}
                    </div>
                    {actions}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-950"
          onClick={prev}
          disabled={idx <= 0}
        >
          Previous
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-950"
            onClick={() => setFlipped((v) => !v)}
            disabled={!current}
          >
            Flip
          </button>
          <button
            type="button"
            className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-950"
            onClick={next}
            disabled={idx >= words.length - 1}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
