"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";
import LogoMark from "@/components/LogoMark";

type Bucket = "KNOWN" | "TO_STUDY" | "FORGOTTEN" | "MIXED";

type Word = {
  id: string;
  term: string;
  meaning: string;
  example: string | null;
  bucket: "KNOWN" | "TO_STUDY" | "FORGOTTEN";
  audioUrl: string | null;
  audioPublicId: string | null;
};

function textSizeForLength(args: {
  len: number;
  thresholds: [number, number];
  classes: [string, string, string];
}) {
  const [t1, t2] = args.thresholds;
  if (args.len >= t2) return args.classes[2];
  if (args.len >= t1) return args.classes[1];
  return args.classes[0];
}

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

export default function DashboardClient() {
  const { data: session } = useSession();
  const [active, setActive] = useState<Bucket>("MIXED");
  const [words, setWords] = useState<Word[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [term, setTerm] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [saving, setSaving] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [editing, setEditing] = useState<Word | null>(null);
  const [editTerm, setEditTerm] = useState("");
  const [editMeaning, setEditMeaning] = useState("");
  const [editExample, setEditExample] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState<Word | null>(null);
  const [deletingNow, setDeletingNow] = useState(false);

  const tabs: Bucket[] = useMemo(
    () => ["MIXED", "FORGOTTEN", "KNOWN"],
    [],
  );

  async function load(opts?: { silent?: boolean }) {
    if (!opts?.silent) setLoading(true);
    setError(null);
    const res = await fetch(`/api/words?bucket=${active}`);
    const json = (await res.json().catch(() => null)) as
      | { ok: true; words: Word[] }
      | { error: string }
      | null;

    if (!opts?.silent) setLoading(false);

    if (!res.ok || !json || "error" in json) {
      setError(json && "error" in json ? json.error : "Failed to load.");
      return;
    }

    setWords(json.words);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return words;
    return words.filter((w) => {
      return (
        w.term.toLowerCase().includes(q) ||
        w.meaning.toLowerCase().includes(q) ||
        (w.example ?? "").toLowerCase().includes(q)
      );
    });
  }, [words, query]);

  async function createWord() {
    setSaving(true);
    setError(null);
    setNotice(null);

    let audioUrl: string | undefined;
    let audioPublicId: string | undefined;
    let audioFailed = false;

    if (term.trim()) {
      const tts = await fetch("/api/audio/tts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ term }),
      });
      const ttsJson = (await tts.json().catch(() => null)) as
        | { ok: true; audioUrl: string; audioPublicId: string }
        | { error: string }
        | null;

      if (!tts.ok || !ttsJson || "error" in ttsJson) {
        audioFailed = true;
      } else {
        audioUrl = ttsJson.audioUrl;
        audioPublicId = ttsJson.audioPublicId;
      }
    }

    const res = await fetch("/api/words", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        term,
        meaning,
        example: example || undefined,
        // New words always start in "Needs review"
        bucket: "FORGOTTEN",
        audioUrl,
        audioPublicId,
      }),
    });

    const json = (await res.json().catch(() => null)) as
      | { ok: true; word: Word }
      | { error: string }
      | null;

    if (!res.ok || !json || "error" in json) {
      setSaving(false);
      setError(json && "error" in json ? json.error : "Save failed.");
      return;
    }

    // If audio generation failed, we still save the word, then try once more.
    if (audioFailed && term.trim()) {
      try {
        const tts = await fetch("/api/audio/tts", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ term }),
        });
        const ttsJson = (await tts.json().catch(() => null)) as
          | { ok: true; audioUrl: string; audioPublicId: string }
          | { error: string }
          | null;

        if (tts.ok && ttsJson && !("error" in ttsJson)) {
          await fetch(`/api/words/${json.word.id}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              audioUrl: ttsJson.audioUrl,
              audioPublicId: ttsJson.audioPublicId,
            }),
          }).catch(() => null);
          setNotice("Saved. Audio generated successfully.");
        } else {
          setNotice(
            "Saved without audio. Check Cloudinary settings to enable auto-audio.",
          );
        }
      } catch {
        setNotice(
          "Saved without audio. Check Cloudinary settings to enable auto-audio.",
        );
      }
    }

    setSaving(false);
    setShowAdd(false);
    setTerm("");
    setMeaning("");
    setExample("");
    await load();
  }

  function openEdit(w: Word) {
    setEditing(w);
    setEditTerm(w.term);
    setEditMeaning(w.meaning);
    setEditExample(w.example ?? "");
    setError(null);
  }

  async function saveEdit() {
    if (!editing) return;
    setSavingEdit(true);
    setError(null);
    setNotice(null);

    const termTrim = editTerm.trim();
    const meaningTrim = editMeaning.trim();
    if (!termTrim || !meaningTrim) {
      setSavingEdit(false);
      setError("Word and meaning are required.");
      return;
    }

    let audioUrl: string | null | undefined = editing.audioUrl;
    let audioPublicId: string | null | undefined = editing.audioPublicId;

    if (termTrim !== editing.term) {
      const tts = await fetch("/api/audio/tts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ term: termTrim }),
      });
      const ttsJson = (await tts.json().catch(() => null)) as
        | { ok: true; audioUrl: string; audioPublicId: string }
        | { error: string }
        | null;

      if (tts.ok && ttsJson && !("error" in ttsJson)) {
        audioUrl = ttsJson.audioUrl;
        audioPublicId = ttsJson.audioPublicId;
      } else {
        audioUrl = null;
        audioPublicId = null;
        setNotice("Term updated; pronunciation audio could not be regenerated.");
      }
    }

    const res = await fetch(`/api/words/${editing.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        term: termTrim,
        meaning: meaningTrim,
        example: editExample.trim() || null,
        ...(audioUrl !== editing.audioUrl || audioPublicId !== editing.audioPublicId
          ? { audioUrl, audioPublicId }
          : {}),
      }),
    });

    const json = (await res.json().catch(() => null)) as
      | { ok: true }
      | { error: string }
      | null;

    setSavingEdit(false);

    if (!res.ok || !json || "error" in json) {
      setError(json && "error" in json ? json.error : "Update failed.");
      return;
    }

    setEditing(null);
    await load({ silent: true });
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeletingNow(true);
    setError(null);
    setNotice(null);

    const res = await fetch(`/api/words/${deleting.id}`, { method: "DELETE" }).catch(
      () => null,
    );
    setDeletingNow(false);

    if (!res || !res.ok) {
      setError("Delete failed. Please try again.");
      return;
    }

    setDeleting(null);
    await load({ silent: true });
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!userMenuOpen) return;
      if (!menuRef.current) return;
      if (e.target instanceof Node && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [userMenuOpen]);

  const userEmail = session?.user?.email ?? "Account";
  const userInitial = (session?.user?.email?.[0] ?? "U").toUpperCase();

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <LogoMark />
          <div className="flex flex-col">
            <div className="text-sm font-medium">Flashcards</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Mixed by default, tabs when you need them
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdd(true)}
            className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-950"
          >
            + Add word
          </button>
          <Link
            href="/app/study"
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-950"
          >
            Study mode
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              className="inline-flex size-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-sm font-semibold dark:border-zinc-800 dark:bg-zinc-950"
              onClick={() => setUserMenuOpen((v) => !v)}
              aria-label="Account menu"
              title={userEmail}
            >
              {userInitial}
            </button>
            {userMenuOpen ? (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                <div className="px-2 pb-2">
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    Signed in as
                  </div>
                  <div className="truncate text-sm font-medium">{userEmail}</div>
                </div>
                <div className="px-2 py-2">
                  <ThemeToggle />
                </div>
                <button
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-950"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={[
              "rounded-xl px-3 py-2 text-sm font-medium",
              t === active
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
                : "border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950",
            ].join(" ")}
          >
            {label(t)}
          </button>
        ))}
        <div className="ml-auto w-full sm:w-auto sm:min-w-72">
          <input
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100">
          {error}
        </div>
      ) : null}

      {notice ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100">
          {notice}
        </div>
      ) : null}

      <main className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Loading...</div>
        ) : filtered.length ? (
          filtered.map((w) => (
            <Flashcard
              key={w.id}
              word={w}
              onChanged={() => void load({ silent: true })}
              onEdit={openEdit}
              onDelete={(word) => setDeleting(word)}
            />
          ))
        ) : (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            No matching cards.
          </div>
        )}
      </main>

      {showAdd ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-5 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">Add a new card</div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Front: word + audio. Back: meaning + example.
                </div>
              </div>
              <button
                className="rounded-lg px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                onClick={() => setShowAdd(false)}
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block text-sm">
                <span className="text-zinc-700 dark:text-zinc-300">Word</span>
                <input
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  maxLength={64}
                  placeholder="e.g. curious"
                />
              </label>
              <label className="block text-sm">
                <span className="text-zinc-700 dark:text-zinc-300">Meaning</span>
                <textarea
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950"
                  value={meaning}
                  onChange={(e) => setMeaning(e.target.value)}
                  maxLength={400}
                  rows={3}
                />
              </label>
              <label className="block text-sm">
                <span className="text-zinc-700 dark:text-zinc-300">Example</span>
                <textarea
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950"
                  value={example}
                  onChange={(e) => setExample(e.target.value)}
                  maxLength={600}
                  rows={2}
                />
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-950"
                  onClick={() => setShowAdd(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-950"
                  onClick={createWord}
                  disabled={saving || !term.trim() || !meaning.trim()}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-5 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">Edit card</div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Changing the word regenerates pronunciation audio when possible.
                </div>
              </div>
              <button
                className="rounded-lg px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                onClick={() => setEditing(null)}
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block text-sm">
                <span className="text-zinc-700 dark:text-zinc-300">Word</span>
                <input
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950"
                  value={editTerm}
                  onChange={(e) => setEditTerm(e.target.value)}
                  maxLength={64}
                />
              </label>
              <label className="block text-sm">
                <span className="text-zinc-700 dark:text-zinc-300">Meaning</span>
                <textarea
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950"
                  value={editMeaning}
                  onChange={(e) => setEditMeaning(e.target.value)}
                  maxLength={400}
                  rows={3}
                />
              </label>
              <label className="block text-sm">
                <span className="text-zinc-700 dark:text-zinc-300">Example</span>
                <textarea
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950"
                  value={editExample}
                  onChange={(e) => setEditExample(e.target.value)}
                  maxLength={600}
                  rows={2}
                />
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-950"
                  onClick={() => setEditing(null)}
                  disabled={savingEdit}
                >
                  Cancel
                </button>
                <button
                  className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-950"
                  onClick={() => void saveEdit()}
                  disabled={savingEdit || !editTerm.trim() || !editMeaning.trim()}
                >
                  {savingEdit ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {deleting ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">Delete card?</div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  This action can&apos;t be undone.
                </div>
                <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900/40">
                  <div className="font-medium">{deleting.term}</div>
                  <div className="mt-1 line-clamp-2 text-zinc-700 dark:text-zinc-300">
                    {deleting.meaning}
                  </div>
                </div>
              </div>
              <button
                className="rounded-lg px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                onClick={() => setDeleting(null)}
                disabled={deletingNow}
              >
                Close
              </button>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-950"
                onClick={() => setDeleting(null)}
                disabled={deletingNow}
              >
                Cancel
              </button>
              <button
                className="rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                onClick={() => void confirmDelete()}
                disabled={deletingNow}
              >
                {deletingNow ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Flashcard({
  word,
  onChanged,
  onEdit,
  onDelete,
}: {
  word: Word;
  onChanged: () => void;
  onEdit: (w: Word) => void;
  onDelete: (w: Word) => void;
}) {
  function mark(bucket: "KNOWN" | "FORGOTTEN") {
    void fetch(`/api/words/${word.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bucket }),
    }).catch(() => null);
    onChanged();
  }

  const termSize = textSizeForLength({
    len: word.term.length,
    thresholds: [14, 22],
    classes: ["text-2xl", "text-xl", "text-lg"],
  });
  const meaningSize = textSizeForLength({
    len: word.meaning.length,
    thresholds: [180, 320],
    classes: ["text-sm", "text-xs", "text-[11px]"],
  });
  const exampleSize = textSizeForLength({
    len: (word.example ?? "").length,
    thresholds: [220, 420],
    classes: ["text-sm", "text-xs", "text-[11px]"],
  });

  const actions = (
    <div className="mt-auto flex gap-2 pt-4">
      <button
        type="button"
        className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium dark:border-zinc-800 dark:bg-zinc-950"
        onClick={(e) => {
          e.stopPropagation();
          mark("KNOWN");
        }}
      >
        Got it
      </button>
      <button
        type="button"
        className="flex-1 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-950"
        onClick={(e) => {
          e.stopPropagation();
          mark("FORGOTTEN");
        }}
      >
        Again
      </button>
    </div>
  );

  const toolbar = (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        className="inline-flex size-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(word);
        }}
        aria-label="Edit card"
        title="Edit"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        className="inline-flex size-9 items-center justify-center rounded-xl border border-red-200 bg-white text-red-700 dark:border-red-900/50 dark:bg-zinc-950 dark:text-red-400"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(word);
        }}
        aria-label="Delete card"
        title="Delete"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M3 6h18M8 6V4h8v2m-1 0v14a1 1 0 01-1 1H9a1 1 0 01-1-1V6h8zM10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );

  return (
    <div
      className="group rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex min-h-88 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="w-full min-w-0">
            <div className={[termSize, "font-semibold tracking-tight"].join(" ")}>
              {word.term}
            </div>
          </div>
          {toolbar}
        </div>

        <div className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Meaning
            </div>
            <div className={[meaningSize, "mt-1 leading-6"].join(" ")}>
              {word.meaning}
            </div>
          </div>

          {word.example ? (
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Example
              </div>
              <div
                className={[
                  exampleSize,
                  "mt-1 leading-6 italic text-zinc-800 dark:text-zinc-200",
                ].join(" ")}
              >
                {word.example}
              </div>
            </div>
          ) : null}
        </div>

        {word.audioUrl ? (
          <audio className="w-full" controls src={word.audioUrl} />
        ) : (
          <div className="h-10" aria-hidden />
        )}

        {actions}
      </div>
    </div>
  );
}

