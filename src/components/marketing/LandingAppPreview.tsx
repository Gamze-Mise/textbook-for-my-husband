"use client";

import { useState } from "react";
import LogoMark from "@/components/LogoMark";
import WordImage from "@/components/WordImage";
import { btnSecondaryCompact, tabPillActive, tabPillIdle } from "@/components/ui/buttonClasses";
import { wordBucketBadgeClass } from "@/lib/wordBucketStyles";
import {
  deckTabLabel,
  wordBucketLabel,
  type WordBucket,
} from "@/types/word";

type PreviewTab = "library" | "study" | "quiz";

const MOCK_CARDS = [
  {
    term: "resilient",
    meaning: "able to recover quickly from difficulty",
    example: "She stayed resilient through every setback.",
    bucket: "FORGOTTEN" as WordBucket,
  },
  {
    term: "meticulous",
    meaning: "showing great attention to detail",
    example: "He kept meticulous notes on each chapter.",
    bucket: "TO_STUDY" as WordBucket,
  },
  {
    term: "curious",
    meaning: "eager to know or learn something",
    example: null,
    bucket: "KNOWN" as WordBucket,
  },
];

const QUIZ_CHOICES = [
  "showing great attention to detail",
  "unwilling to change one's mind",
  "extremely loud or bright",
  "lacking physical energy",
];

function MockAudioBar() {
  return (
    <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-zinc-200/80 bg-zinc-50 px-2 dark:border-zinc-700 dark:bg-zinc-900/50">
      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
        <svg className="size-3.5 text-zinc-600 dark:text-zinc-300" viewBox="0 0 24 24" aria-hidden>
          <path d="M8 5v14l11-7z" fill="currentColor" />
        </svg>
      </span>
      <div className="h-1 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div className="h-full w-1/4 rounded-full bg-zinc-400 dark:bg-zinc-500" />
      </div>
      <span className="text-[10px] tabular-nums text-zinc-400">0:02</span>
    </div>
  );
}

function MockFlashcard({
  term,
  meaning,
  example,
  bucket,
}: (typeof MOCK_CARDS)[number]) {
  return (
    <article className="flex h-full min-h-0 flex-col rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-4">
      <div className="relative shrink-0 overflow-hidden rounded-xl ring-1 ring-zinc-200/80 dark:ring-zinc-800">
        <span
          className={[
            "absolute right-2 top-2 z-10 rounded-md border px-2 py-0.5 text-[10px] font-semibold shadow-md backdrop-blur-[2px] sm:text-[11px]",
            wordBucketBadgeClass(bucket),
          ].join(" ")}
        >
          {wordBucketLabel(bucket)}
        </span>
        <WordImage src={null} alt="" className="aspect-[16/10] w-full object-cover" />
      </div>
      <p className="mt-3 text-lg font-semibold tracking-tight">{term}</p>
      <div className="mt-2 flex min-h-0 flex-1 flex-col gap-2 text-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Meaning
          </p>
          <p className="mt-0.5 leading-snug text-zinc-800 dark:text-zinc-200">{meaning}</p>
        </div>
        {example ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Example
            </p>
            <p className="mt-0.5 line-clamp-2 text-sm italic leading-snug text-zinc-800 dark:text-zinc-200">
              {example}
            </p>
          </div>
        ) : null}
      </div>
      <div className="mt-3 shrink-0">
        <MockAudioBar />
      </div>
    </article>
  );
}

function LibraryPreview() {
  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <LogoMark />
          <div>
            <p className="text-sm font-medium">Flashcards</p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Mixed by default, tabs when you need them
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-xl bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-950">
            + Add word
          </span>
          <span className={btnSecondaryCompact}>Study</span>
          <span className={btnSecondaryCompact}>Quiz</span>
        </div>
      </header>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-xl bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-950">
            All
          </span>
          {(["FORGOTTEN", "TO_STUDY", "KNOWN"] as const).map((t) => (
            <span
              key={t}
              className="rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium dark:border-zinc-800 dark:bg-zinc-950"
            >
              {deckTabLabel(t)}
            </span>
          ))}
        </div>
        <div className="h-8 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs leading-8 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 sm:max-w-48">
          Search...
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {MOCK_CARDS.map((c) => (
          <MockFlashcard key={c.term} {...c} />
        ))}
      </div>
    </div>
  );
}

function StudyPreview() {
  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Study mode</p>
          <h3 className="text-lg font-semibold tracking-tight">Flashcards</h3>
        </div>
        <div className="flex gap-1.5">
          <span className={btnSecondaryCompact}>Library</span>
          <span className={btnSecondaryCompact}>Quiz</span>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className={tabPillActive}>Mixed</span>
        <span className={tabPillIdle}>Needs review</span>
        <span className={tabPillIdle}>Known</span>
        <span className="ml-auto text-xs text-zinc-500">12 left</span>
      </div>

      <article className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-4 shadow-md dark:border-zinc-700 dark:bg-zinc-950 sm:p-5">
        <div className="overflow-hidden rounded-2xl ring-1 ring-zinc-200/80 dark:ring-zinc-800">
          <WordImage src={null} alt="" className="aspect-16/10 w-full object-cover" />
        </div>
        <div className="mt-4 text-center">
          <p className="text-3xl font-semibold tracking-tight">resilient</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Tap to flip</p>
        </div>
        <div className="mt-4">
          <MockAudioBar />
        </div>
        <div className="mt-4 flex gap-2">
          <div className="flex-1 rounded-xl border border-zinc-200 bg-white py-2.5 text-center text-sm font-medium dark:border-zinc-800 dark:bg-zinc-950">
            Got it
          </div>
          <div className="flex-1 rounded-xl bg-zinc-900 py-2.5 text-center text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-950">
            Again
          </div>
        </div>
      </article>
    </div>
  );
}

function QuizPreview() {
  return (
    <div className="space-y-3">
      <div className="h-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div className="h-full w-[35%] rounded-full bg-zinc-900 dark:bg-zinc-100" />
      </div>

      <div className="grid gap-3 lg:grid-cols-[42%_1fr]">
        <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
            <p className="text-xs font-medium text-zinc-500">
              Question <span className="text-zinc-800 dark:text-zinc-200">7 / 20</span>
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">Word</p>
          </div>
          <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-900">
            <WordImage src={null} alt="" className="absolute inset-0 size-full object-cover" />
          </div>
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-4">
          <h3 className="text-2xl font-semibold tracking-tight">meticulous</h3>
          <div className="mt-2">
            <MockAudioBar />
          </div>
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
            What does it mean?
          </p>
          <ul className="mt-2 space-y-1.5">
            {QUIZ_CHOICES.map((text, i) => (
              <li
                key={text}
                className={[
                  "flex items-start gap-2 rounded-xl border px-2.5 py-2 text-left text-xs sm:text-sm",
                  i === 0
                    ? "border-emerald-500/90 bg-emerald-50 text-emerald-950 dark:border-emerald-400/80 dark:bg-emerald-950/40 dark:text-emerald-50"
                    : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900",
                ].join(" ")}
              >
                <span
                  className={[
                    "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold",
                    i === 0
                      ? "bg-emerald-200/90 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-100"
                      : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
                  ].join(" ")}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 leading-snug">{text}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}

const PREVIEW_TABS: { id: PreviewTab; label: string }[] = [
  { id: "library", label: "Library" },
  { id: "study", label: "Study" },
  { id: "quiz", label: "Quiz" },
];

export default function LandingAppPreview() {
  const [tab, setTab] = useState<PreviewTab>("library");

  return (
    <div className="w-full">
      <div className="mb-3 flex justify-center gap-1 rounded-xl border border-zinc-200 bg-zinc-100/80 p-1 dark:border-zinc-800 dark:bg-zinc-900/80">
        {PREVIEW_TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={[
              "rounded-lg px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:text-sm",
              tab === id
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100/50 shadow-xl shadow-zinc-900/10 ring-1 ring-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900/50 dark:shadow-black/40 dark:ring-white/5">
        <div className="flex items-center gap-2 border-b border-zinc-200/80 bg-white/90 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-950/90">
          <span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          <span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          <span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          <span className="ml-2 flex-1 truncate rounded-md bg-zinc-100 px-3 py-1 text-center text-[11px] text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            flashcards.app
          </span>
        </div>
        <div className="max-h-[min(70vh,36rem)] overflow-y-auto overscroll-contain bg-zinc-50 p-3 dark:bg-zinc-950 sm:p-4">
          {tab === "library" ? <LibraryPreview /> : null}
          {tab === "study" ? <StudyPreview /> : null}
          {tab === "quiz" ? <QuizPreview /> : null}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-500">
        Same UI you use after sign-in — switch tabs to preview.
      </p>
    </div>
  );
}
