"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

type Bucket = "KNOWN" | "TO_STUDY" | "FORGOTTEN" | "MIXED";

type Word = {
  id: string;
  term: string;
  meaning: string;
  example: string | null;
  bucket: "KNOWN" | "TO_STUDY" | "FORGOTTEN";
  audioUrl: string | null;
};

const BUCKETS: Bucket[] = ["MIXED", "FORGOTTEN", "KNOWN"];

function label(b: Bucket) {
  switch (b) {
    case "KNOWN":
      return "Known";
    case "TO_STUDY":
      return "Learning";
    case "FORGOTTEN":
      return "Needs review";
    case "MIXED":
      return "Mixed";
  }
}

/** Card height stays stable when flipping (front / back). */
const CARD_BODY = "flex min-h-[22rem] flex-col";

export default function StudyClient() {
  const [bucket, setBucket] = useState<Bucket>("MIXED");
  const [words, setWords] = useState<Word[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    const res = await fetch(`/api/words?bucket=${bucket}`);
    const json = (await res.json().catch(() => null)) as
      | { ok: true; words: Word[] }
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

  function next() {
    setFlipped(false);
    setIdx((v) => Math.min(v + 1, Math.max(0, words.length - 1)));
  }

  function prev() {
    setFlipped(false);
    setIdx((v) => Math.max(v - 1, 0));
  }

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
    <div className="mx-auto w-full max-w-3xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Study mode
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Flashcards</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-950"
            href="/app"
          >
            Back to library
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {BUCKETS.map((b) => (
          <button
            key={b}
            onClick={() => setBucket(b)}
            className={[
              "rounded-xl px-3 py-2 text-sm font-medium",
              b === bucket
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
                : "border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950",
            ].join(" ")}
          >
            {label(b)}
          </button>
        ))}
        <div className="ml-auto text-sm text-zinc-600 dark:text-zinc-400">
          {remaining}
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100">
          {error}
        </div>
      ) : null}

      <div className="mt-6">
        {loading ? (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Loading...
          </div>
        ) : !current ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
            No cards in this deck.
          </div>
        ) : (
          <div
            className="cursor-pointer rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
            onClick={() => setFlipped((v) => !v)}
            role="button"
            tabIndex={0}
          >
            {!flipped ? (
              <div className={CARD_BODY}>
                <div className="flex min-h-0 flex-1 items-center justify-center">
                  <div className="w-full text-center">
                    <div className="text-4xl font-semibold tracking-tight">
                      {current.term}
                    </div>
                    <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      Tap to flip
                    </div>
                  </div>
                </div>
                {current.audioUrl ? (
                  <audio
                    className="w-full"
                    controls
                    src={current.audioUrl}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div className="h-10" aria-hidden />
                )}
                {actions}
              </div>
            ) : (
              <div className={CARD_BODY}>
                <div className="flex min-h-0 flex-1 items-center justify-center">
                  <div className="max-h-full w-full overflow-y-auto pr-1 text-center">
                    <div className="space-y-4">
                      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Answer
                      </div>
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
                {current.audioUrl ? (
                  <audio
                    className="w-full"
                    controls
                    src={current.audioUrl}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : null}
                {actions}
              </div>
            )}
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
