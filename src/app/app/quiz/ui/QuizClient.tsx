"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import AppNavLink from "@/components/app/AppNavLink";
import AppPageHeader from "@/components/app/AppPageHeader";
import AppAccountMenu from "@/components/app/AppAccountMenu";
import AlertBanner from "@/components/app/AlertBanner";
import WordImage from "@/components/WordImage";
import { btnPrimary, btnSecondary } from "@/components/ui/buttonClasses";
import type { QuizQuestion } from "@/types/quiz";
import { quizCorrectCount } from "@/types/quiz";

type QuizJson =
  | { ok: true; questions: QuizQuestion[] }
  | { error: string }
  | null;

export default function QuizClient() {
  const promptId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<(number | null)[]>([]);
  const [finished, setFinished] = useState(false);
  const forgottenMarkedRef = useRef<Set<string>>(new Set());

  const loadQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFinished(false);
    setStep(0);
    setPicked([]);
    forgottenMarkedRef.current.clear();

    const res = await fetch("/api/quiz", { cache: "no-store" });
    const json = (await res.json().catch(() => null)) as QuizJson;

    setLoading(false);

    if (!res.ok || !json || !("ok" in json && json.ok)) {
      setQuestions([]);
      setError(json && "error" in json ? json.error : "Could not load quiz.");
      return;
    }

    setQuestions(json.questions);
    setPicked(Array.from({ length: json.questions.length }, () => null));
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void loadQuiz();
    }, 0);
    return () => window.clearTimeout(t);
  }, [loadQuiz]);

  const total = questions.length;
  const current = questions[step] ?? null;
  const choiceLocked = picked[step] !== null;

  /** Wrong answer → move card to Needs review (FORGOTTEN), once per word per quiz load. */
  useEffect(() => {
    if (finished || loading || error || !current) return;
    const chosen = picked[step];
    if (chosen === null) return;
    if (chosen === current.answerIndex) return;
    if (current.bucket === "FORGOTTEN") return;
    if (forgottenMarkedRef.current.has(current.wordId)) return;
    forgottenMarkedRef.current.add(current.wordId);
    void fetch(`/api/words/${current.wordId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bucket: "FORGOTTEN" }),
    }).catch(() => {});
  }, [current, error, finished, loading, picked, step]);

  const score = useMemo(() => {
    if (!finished || !questions.length) return null;
    return quizCorrectCount(questions, picked);
  }, [finished, questions, picked]);

  const progressPct = useMemo(() => {
    if (!total) return 0;
    if (finished) return 100;
    return Math.round(((step + 1) / total) * 100);
  }, [finished, step, total]);

  const selectChoice = useCallback(
    (index: number) => {
      setPicked((prev) => {
        if (prev[step] !== null) return prev;
        const next = [...prev];
        next[step] = index;
        return next;
      });
    },
    [step],
  );

  const nextOrFinish = useCallback(() => {
    if (step >= total - 1) {
      setFinished(true);
      return;
    }
    setStep((s) => s + 1);
  }, [step, total]);

  const prev = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  useEffect(() => {
    if (finished || loading || error || !current || total === 0) return;

    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable)
      ) {
        return;
      }

      if (e.key >= "1" && e.key <= "4") {
        if (picked[step] !== null) return;
        e.preventDefault();
        selectChoice(Number(e.key) - 1);
        return;
      }
      if (e.key === "Enter" && picked[step] !== null) {
        e.preventDefault();
        nextOrFinish();
        return;
      }

      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        if (t?.closest("audio")) return;
        if (e.key === "ArrowLeft") {
          if (step > 0) {
            e.preventDefault();
            prev();
          }
          return;
        }
        if (picked[step] !== null) {
          e.preventDefault();
          nextOrFinish();
        }
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    current,
    error,
    finished,
    loading,
    nextOrFinish,
    picked,
    prev,
    selectChoice,
    step,
    total,
  ]);

  useEffect(() => {
    if (!loading && !finished && current) {
      rootRef.current?.focus({ preventScroll: true });
    }
  }, [loading, finished, step, current]);

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      className="mx-auto flex min-h-0 flex-1 w-full max-w-6xl flex-col overflow-hidden px-4 pb-4 pt-4 outline-none focus:outline-none sm:px-6 sm:pb-5 sm:pt-5"
    >
      <div className="shrink-0">
        <AppPageHeader
          kicker="Vocabulary"
          title="Quiz"
          showBottomBorder={false}
          actions={
            <>
              <AppNavLink href="/app">Library</AppNavLink>
              <AppNavLink href="/app/study">Study</AppNavLink>
              <AppAccountMenu />
            </>
          }
        />
      </div>

      <div className="mt-3 h-1 shrink-0 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800 sm:mt-4">
        <div
          className="h-full rounded-full bg-zinc-900 transition-[width] duration-300 ease-out dark:bg-zinc-100"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {error ? (
        <div className="mt-4 shrink-0">
          <AlertBanner variant="warning">{error}</AlertBanner>
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 flex min-h-0 flex-1 animate-pulse flex-col gap-3 p-1" aria-hidden>
          <div className="h-4 w-36 shrink-0 rounded-md bg-zinc-200 dark:bg-zinc-800" />
          <div className="min-h-0 flex-1 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-24 shrink-0 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      ) : null}

      {!loading && !error && total > 0 && !finished && current ? (
        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-hidden lg:flex-row lg:gap-5">
          {/* Prompt column */}
          <article className="flex max-h-[min(40vh,24rem)] min-h-0 shrink-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:max-h-none lg:min-h-0 lg:w-[46%] lg:flex-1">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-zinc-100 px-3 py-2 dark:border-zinc-800 sm:px-4">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Question{" "}
                <span className="tabular-nums text-zinc-700 dark:text-zinc-200">
                  {step + 1} / {total}
                </span>
              </p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Word
              </p>
            </div>
            <div className="relative min-h-36 max-h-[26vh] shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-900 lg:max-h-none lg:min-h-0 lg:flex-1 lg:shrink">
              <WordImage
                src={current.imageSrc}
                alt=""
                objectPosition={current.imageObjectPosition}
                className="absolute inset-0 size-full object-cover"
              />
            </div>
          </article>

          {/* Answers column */}
          <article className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:w-[54%] lg:flex-1">
            <div className="flex min-h-0 flex-1 flex-col gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4">
              <h2 className="shrink-0 text-2xl font-semibold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                {current.term}
              </h2>
              {current.playbackAudioSrc ? (
                <audio
                  className="h-9 w-full shrink-0 rounded-lg"
                  controls
                  src={current.playbackAudioSrc}
                  tabIndex={-1}
                />
              ) : null}
              <p
                id={promptId}
                className="shrink-0 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
              >
                What does it mean?
              </p>
              <div
                role="radiogroup"
                aria-labelledby={promptId}
                className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain scrollbar-gutter-stable sm:gap-2"
              >
                {current.choices.map((text, i) => {
                  const selected = picked[step] === i;
                  const isCorrect = i === current.answerIndex;
                  const chosen = picked[step];
                  const wrongPick = chosen !== null && chosen === i && !isCorrect;

                  let rowClass =
                    "flex w-full shrink-0 items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950 sm:gap-3 sm:px-3.5 sm:py-2.5";

                  if (choiceLocked) {
                    if (isCorrect) {
                      rowClass +=
                        " border-emerald-500/90 bg-emerald-50 text-emerald-950 dark:border-emerald-400/80 dark:bg-emerald-950/40 dark:text-emerald-50";
                    } else if (wrongPick) {
                      rowClass +=
                        " border-red-500/90 bg-red-50 text-red-950 dark:border-red-400/80 dark:bg-red-950/35 dark:text-red-50";
                    } else {
                      rowClass +=
                        " border-zinc-200/80 bg-zinc-50 text-zinc-500 opacity-70 dark:border-zinc-700/80 dark:bg-zinc-900/50 dark:text-zinc-400";
                    }
                  } else if (selected) {
                    rowClass +=
                      " border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950";
                  } else {
                    rowClass +=
                      " border-zinc-200 bg-white hover:border-zinc-300 active:scale-[0.99] dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600";
                  }

                  let badgeClass =
                    "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold tabular-nums sm:size-7 sm:rounded-lg sm:text-xs";
                  if (choiceLocked) {
                    if (isCorrect) {
                      badgeClass +=
                        " bg-emerald-200/90 text-emerald-900 ring-1 ring-emerald-600/25 dark:bg-emerald-900/60 dark:text-emerald-100 dark:ring-emerald-400/20";
                    } else if (wrongPick) {
                      badgeClass +=
                        " bg-red-200/90 text-red-900 ring-1 ring-red-600/25 dark:bg-red-900/60 dark:text-red-100 dark:ring-red-400/20";
                    } else {
                      badgeClass +=
                        " bg-zinc-200 text-zinc-500 ring-1 ring-zinc-300/80 dark:bg-zinc-800 dark:text-zinc-500 dark:ring-zinc-600/50";
                    }
                  } else if (selected) {
                    badgeClass +=
                      " bg-white/15 text-white ring-1 ring-white/25 dark:bg-zinc-900/10 dark:text-zinc-950 dark:ring-zinc-900/15";
                  } else {
                    badgeClass +=
                      " bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200/90 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-600/80";
                  }

                  let textClass = "min-w-0 flex-1 leading-snug sm:leading-relaxed ";
                  if (choiceLocked) {
                    if (isCorrect) {
                      textClass += "font-medium text-emerald-950 dark:text-emerald-50";
                    } else if (wrongPick) {
                      textClass += "font-medium text-red-950 dark:text-red-50";
                    } else {
                      textClass += "text-zinc-600 dark:text-zinc-400";
                    }
                  } else {
                    textClass += selected
                      ? "text-white/95 dark:text-zinc-950"
                      : "text-zinc-800 dark:text-zinc-100";
                  }

                  return (
                    <button
                      key={`${current.wordId}-${i}`}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={choiceLocked}
                      onClick={() => selectChoice(i)}
                      className={rowClass}
                    >
                      <span className={badgeClass} aria-hidden>
                        {i + 1}
                      </span>
                      <span className={textClass}>{text}</span>
                    </button>
                  );
                })}
              </div>

              {choiceLocked ? (
                <div
                  className="mt-2 shrink-0 space-y-1.5 rounded-lg border border-zinc-200 bg-zinc-50/90 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-900/50 sm:space-y-2 sm:px-3 sm:py-3"
                  aria-live="polite"
                >
                  <p
                    className={
                      picked[step] === current.answerIndex
                        ? "text-xs font-semibold text-emerald-800 dark:text-emerald-200 sm:text-sm"
                        : "text-xs font-semibold text-red-800 dark:text-red-200 sm:text-sm"
                    }
                  >
                    {picked[step] === current.answerIndex ? "Correct." : "Wrong."}
                  </p>
                  {current.example?.trim() ? (
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Example
                      </p>
                      <p className="mt-0.5 line-clamp-3 text-xs italic leading-relaxed text-zinc-800 dark:text-zinc-200 sm:line-clamp-none sm:text-sm">
                        {current.example.trim()}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-auto flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <button type="button" className={btnSecondary} onClick={prev} disabled={step <= 0}>
                  Back
                </button>
                <button
                  type="button"
                  className={btnPrimary}
                  onClick={nextOrFinish}
                  disabled={picked[step] === null}
                >
                  {step >= total - 1 ? "See results" : "Next"}
                </button>
              </div>
            </div>
          </article>
        </div>
      ) : null}

      {!loading && !error && finished && score !== null ? (
        <div className="mt-4 min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain pb-2">
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
            <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Your score</h2>
            <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
              {score}
              <span className="text-2xl font-normal text-zinc-500 dark:text-zinc-400">
                {" "}
                / {total}
              </span>
            </p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {total > 0 ? `${Math.round((score / total) * 100)}% correct` : ""}
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Review</h3>
            <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
              {questions.map((q, i) => {
                const chosen = picked[i];
                const ok = chosen === q.answerIndex;
                const skipped = chosen === null;
                const correctText = q.choices[q.answerIndex];
                const ex = q.example?.trim();
                return (
                  <li key={q.wordId} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{q.term}</span>
                      <span
                        className={
                          ok
                            ? "text-sm font-medium text-emerald-700 dark:text-emerald-300"
                            : skipped
                              ? "text-sm font-medium text-zinc-500 dark:text-zinc-400"
                              : "text-sm font-medium text-red-700 dark:text-red-300"
                        }
                      >
                        {ok ? "Correct" : skipped ? "Skipped" : "Wrong"}
                      </span>
                    </div>
                    {!ok ? (
                      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                        Correct answer:{" "}
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {correctText}
                        </span>
                      </p>
                    ) : null}
                    {ex ? (
                      <p className="text-sm italic leading-relaxed text-zinc-600 dark:text-zinc-400">
                        Example: {ex}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="flex flex-wrap gap-2">
            <button type="button" className={btnPrimary} onClick={() => void loadQuiz()}>
              Try again
            </button>
            <AppNavLink href="/app">Back to library</AppNavLink>
          </div>
        </div>
      ) : null}
    </div>
  );
}
