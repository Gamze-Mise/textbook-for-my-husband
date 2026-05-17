"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import IllustrationField from "@/components/IllustrationField";
import { validateWordImageFile } from "@/lib/wordImageConstraints";
import { clampImageFocus } from "@/lib/wordImageFocus";
import { wordBucketBadgeClass } from "@/lib/wordBucketStyles";
import WordImage from "@/components/WordImage";
import LogoMark from "@/components/LogoMark";
import AlertBanner from "@/components/app/AlertBanner";
import AppAccountMenu from "@/components/app/AppAccountMenu";
import AppNavLink from "@/components/app/AppNavLink";
import { requestAudioTts } from "@/lib/requestAudioTts";
import {
  type DeckTab,
  type WordCard,
  deckTabLabel,
  wordBucketLabel,
} from "@/types/word";

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

export default function DashboardClient() {
  const [active, setActive] = useState<DeckTab>("MIXED");
  const [words, setWords] = useState<WordCard[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [term, setTerm] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [saving, setSaving] = useState(false);
  const [addImageFile, setAddImageFile] = useState<File | null>(null);
  const [addImagePreviewUrl, setAddImagePreviewUrl] = useState<string | null>(
    null,
  );
  const addPreviewRef = useRef<string | null>(null);
  const [addImageFocusX, setAddImageFocusX] = useState(50);
  const [addImageFocusY, setAddImageFocusY] = useState(50);

  const [editing, setEditing] = useState<WordCard | null>(null);
  const [editTerm, setEditTerm] = useState("");
  const [editMeaning, setEditMeaning] = useState("");
  const [editExample, setEditExample] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreviewUrl, setEditImagePreviewUrl] = useState<string | null>(
    null,
  );
  const editPreviewRef = useRef<string | null>(null);
  const editImageRevertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [editImageFocusX, setEditImageFocusX] = useState(50);
  const [editImageFocusY, setEditImageFocusY] = useState(50);
  const [editImageClear, setEditImageClear] = useState(false);
  const [regeneratingTermAudio, setRegeneratingTermAudio] = useState(false);
  const [deleting, setDeleting] = useState<WordCard | null>(null);
  const [deletingNow, setDeletingNow] = useState(false);

  async function regenerateEditPronunciation() {
    if (!editing) return;
    const termTrim = editTerm.trim();
    if (!termTrim) {
      setError("Word is required to regenerate pronunciation.");
      return;
    }

    setRegeneratingTermAudio(true);
    setError(null);
    setNotice(null);

    const tts = await requestAudioTts({ term: termTrim });
    if (!tts.ok) {
      setRegeneratingTermAudio(false);
      setError(
        "Could not generate audio. On Vercel, set GOOGLE_CLOUD_TTS_API_KEY (see .env.example).",
      );
      return;
    }

    const patch = await fetch(`/api/words/${editing.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ audioPublicId: tts.audioPublicId }),
    });
    const patchJson = (await patch.json().catch(() => null)) as
      | { ok: true }
      | { error: string }
      | null;

    setRegeneratingTermAudio(false);

    if (!patch.ok || !patchJson || "error" in patchJson) {
      setError("Audio generated but could not be saved.");
      return;
    }

    setEditing({
      ...editing,
      audioPublicId: tts.audioPublicId,
      audioSrc: tts.audioSrc,
    });
    setNotice(
      tts.source === "client"
        ? "Pronunciation saved (recorded from your browser)."
        : "Pronunciation saved.",
    );
    await load({ silent: true });
  }

  const tabs: DeckTab[] = useMemo(() => ["MIXED", "FORGOTTEN", "KNOWN"], []);

  async function load(opts?: { silent?: boolean }) {
    if (!opts?.silent) setLoading(true);
    setError(null);
    const res = await fetch(`/api/words?bucket=${active}&library=1`);
    const json = (await res.json().catch(() => null)) as
      | { ok: true; words: WordCard[] }
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
     
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  function revokeAddPreview() {
    if (addPreviewRef.current) {
      URL.revokeObjectURL(addPreviewRef.current);
      addPreviewRef.current = null;
    }
    setAddImagePreviewUrl(null);
  }

  function setAddImagePickerFile(f: File | null) {
    revokeAddPreview();
    setAddImageFile(f);
    if (f) {
      const u = URL.createObjectURL(f);
      addPreviewRef.current = u;
      setAddImagePreviewUrl(u);
    }
  }

  function revokeEditPreview() {
    if (editPreviewRef.current) {
      URL.revokeObjectURL(editPreviewRef.current);
      editPreviewRef.current = null;
    }
    setEditImagePreviewUrl(null);
  }

  function setEditImagePickerFile(f: File | null) {
    revokeEditPreview();
    setEditImageFile(f);
    setEditImageClear(false);
    if (f) {
      const u = URL.createObjectURL(f);
      editPreviewRef.current = u;
      setEditImagePreviewUrl(u);
    }
  }

  function clearEditWordImage() {
    revokeEditPreview();
    setEditImageFile(null);
    setEditImageClear(true);
  }

  useEffect(() => {
    return () => {
      if (addPreviewRef.current) URL.revokeObjectURL(addPreviewRef.current);
      if (editPreviewRef.current) URL.revokeObjectURL(editPreviewRef.current);
      if (editImageRevertTimerRef.current) {
        clearTimeout(editImageRevertTimerRef.current);
        editImageRevertTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!editing && editImageRevertTimerRef.current) {
      clearTimeout(editImageRevertTimerRef.current);
      editImageRevertTimerRef.current = null;
    }
  }, [editing]);

  async function uploadWordImage(
    file: File,
  ): Promise<
    { ok: true; imagePublicId: string } | { ok: false; error: string }
  > {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/words/image", { method: "POST", body: fd });
    const json = (await res.json().catch(() => null)) as
      | { ok: true; imagePublicId: string }
      | { error: string }
      | null;
    if (!res.ok || !json || !("ok" in json && json.ok)) {
      return {
        ok: false,
        error: json && "error" in json ? json.error : "Image upload failed.",
      };
    }
    return { ok: true, imagePublicId: json.imagePublicId };
  }

  async function persistExampleAudio(wordId: string, exampleText: string) {
    const ex = exampleText.trim();
    if (!ex) return { ok: true as const };

    const tts = await requestAudioTts({ text: ex });
    if (!tts.ok) {
      return {
        ok: false as const,
        error: "Example audio could not be generated.",
      };
    }

    const patch = await fetch(`/api/words/${wordId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        exampleAudioPublicId: tts.audioPublicId,
      }),
    });
    const patchJson = (await patch.json().catch(() => null)) as
      | { ok: true }
      | { error: string }
      | null;
    if (!patch.ok || !patchJson || "error" in patchJson) {
      return {
        ok: false as const,
        error:
          patchJson && "error" in patchJson
            ? patchJson.error
            : "Example audio could not be saved. Run `npx prisma db push` or apply migrations for exampleAudioPublicId.",
      };
    }
    return { ok: true as const };
  }

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

    let audioPublicId: string | undefined;
    let audioFailed = false;

    if (term.trim()) {
      const tts = await requestAudioTts({ term: term.trim() });
      if (tts.ok) {
        audioPublicId = tts.audioPublicId;
      } else {
        audioFailed = true;
      }
    }

    let imagePublicId: string | undefined;
    if (addImageFile) {
      const invalid = validateWordImageFile(addImageFile);
      if (invalid) {
        setSaving(false);
        setError(invalid);
        setAddImagePickerFile(null);
        return;
      }
      const img = await uploadWordImage(addImageFile);
      if (!img.ok) {
        setSaving(false);
        setError(img.error);
        return;
      }
      imagePublicId = img.imagePublicId;
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
        audioPublicId,
        ...(imagePublicId
          ? {
              imagePublicId,
              imageFocusX: clampImageFocus(addImageFocusX),
              imageFocusY: clampImageFocus(addImageFocusY),
            }
          : {}),
      }),
    });

    const json = (await res.json().catch(() => null)) as
      | { ok: true; word: WordCard }
      | { error: string }
      | null;

    if (!res.ok || !json || "error" in json) {
      setSaving(false);
      setError(json && "error" in json ? json.error : "Save failed.");
      return;
    }

    if (example.trim()) {
      const ex = await persistExampleAudio(json.word.id, example);
      if (!ex.ok) setNotice(ex.error);
    }

    if (audioFailed && term.trim()) {
      const tts = await requestAudioTts({ term: term.trim() });
      if (tts.ok) {
        await fetch(`/api/words/${json.word.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ audioPublicId: tts.audioPublicId }),
        }).catch(() => null);
        setNotice("Saved. Pronunciation generated on retry.");
      } else {
        setNotice(
          "Saved without audio. Add GOOGLE_CLOUD_TTS_API_KEY on Vercel (see .env.example).",
        );
      }
    }

    setSaving(false);
    setShowAdd(false);
    setTerm("");
    setMeaning("");
    setExample("");
    setAddImagePickerFile(null);
    await load();
  }

  function openEdit(w: WordCard) {
    if (editImageRevertTimerRef.current) {
      clearTimeout(editImageRevertTimerRef.current);
      editImageRevertTimerRef.current = null;
    }
    setEditing(w);
    setEditTerm(w.term);
    setEditMeaning(w.meaning);
    setEditExample(w.example ?? "");
    setEditImageFocusX(w.imageFocusX ?? 50);
    setEditImageFocusY(w.imageFocusY ?? 50);
    setEditImagePickerFile(null);
    setEditImageClear(false);
    setError(null);
  }

  async function saveEdit() {
    if (!editing) return;
    if (editImageRevertTimerRef.current) {
      clearTimeout(editImageRevertTimerRef.current);
      editImageRevertTimerRef.current = null;
    }
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

    let audioPublicId: string | null | undefined = editing.audioPublicId;

    if (termTrim !== editing.term) {
      const tts = await requestAudioTts({ term: termTrim });
      if (tts.ok) {
        audioPublicId = tts.audioPublicId;
      } else {
        audioPublicId = null;
        setNotice(
          "Term updated; pronunciation could not be regenerated. Set GOOGLE_CLOUD_TTS_API_KEY on Vercel.",
        );
      }
    }

    let nextImagePublicId: string | null | undefined = undefined;
    if (editImageClear && !editImageFile) {
      if (editing.imagePublicId) nextImagePublicId = null;
    } else if (editImageFile) {
      const invalid = validateWordImageFile(editImageFile);
      if (invalid) {
        setSavingEdit(false);
        const errMsg = invalid;
        setError(errMsg);
        setEditImagePickerFile(null);
        if (editImageRevertTimerRef.current) {
          clearTimeout(editImageRevertTimerRef.current);
          editImageRevertTimerRef.current = null;
        }
        editImageRevertTimerRef.current = setTimeout(() => {
          editImageRevertTimerRef.current = null;
          setError((cur) => (cur === errMsg ? null : cur));
        }, 3500);
        return;
      }
      const up = await uploadWordImage(editImageFile);
      if (!up.ok) {
        setSavingEdit(false);
        const errMsg = up.error;
        setError(errMsg);
        const hadStoredIllustration =
          Boolean(editing.imageSrc) && !editImageClear;
        if (hadStoredIllustration) {
          setEditImagePickerFile(null);
          if (editImageRevertTimerRef.current) {
            clearTimeout(editImageRevertTimerRef.current);
            editImageRevertTimerRef.current = null;
          }
          editImageRevertTimerRef.current = setTimeout(() => {
            editImageRevertTimerRef.current = null;
            setError((cur) => (cur === errMsg ? null : cur));
          }, 3500);
        }
        return;
      }
      nextImagePublicId = up.imagePublicId;
    }

    const orClearImage = editImageClear && !editImageFile && editing.imagePublicId;
    const hasIllustration =
      (!editImageClear && Boolean(editing.imagePublicId || editing.imageSrc)) ||
      Boolean(editImageFile || editImagePreviewUrl);

    const res = await fetch(`/api/words/${editing.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        term: termTrim,
        meaning: meaningTrim,
        example: editExample.trim() || null,
        ...(editExample.trim() !== (editing.example ?? "").trim()
          ? { exampleAudioPublicId: null }
          : {}),
        ...(audioPublicId !== editing.audioPublicId ? { audioPublicId } : {}),
        ...(nextImagePublicId !== undefined
          ? { imagePublicId: nextImagePublicId }
          : {}),
        ...(hasIllustration && !orClearImage
          ? {
              imageFocusX: clampImageFocus(editImageFocusX),
              imageFocusY: clampImageFocus(editImageFocusY),
            }
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

    const exampleChanged =
      editExample.trim() !== (editing.example ?? "").trim();
    if (
      editExample.trim() &&
      (exampleChanged || !editing.exampleAudioPublicId)
    ) {
      const ex = await persistExampleAudio(editing.id, editExample);
      if (!ex.ok) setNotice(ex.error);
    }

    setEditing(null);
    setEditImagePickerFile(null);
    setEditImageClear(false);
    await load({ silent: true });
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeletingNow(true);
    setError(null);
    setNotice(null);

    const res = await fetch(`/api/words/${deleting.id}`, {
      method: "DELETE",
    }).catch(() => null);
    setDeletingNow(false);

    if (!res || !res.ok) {
      setError("Delete failed. Please try again.");
      return;
    }

    setDeleting(null);
    await load({ silent: true });
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <LogoMark />
          <div className="flex flex-col">
            <div className="text-sm font-medium">Library</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Mixed by default, tabs when you need them
            </div>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap">
          <button
            onClick={() => {
              setError(null);
              setNotice(null);
              setTerm("");
              setMeaning("");
              setExample("");
              setAddImagePickerFile(null);
              setAddImageFocusX(50);
              setAddImageFocusY(50);
              setShowAdd(true);
            }}
            className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-950"
          >
            + Add word
          </button>
          <AppNavLink href="/app/study">Study</AppNavLink>
          <AppNavLink href="/app/quiz">Quiz</AppNavLink>

          <AppAccountMenu />
        </div>
      </header>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center justify-end gap-2 sm:justify-start">
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
              {t === "MIXED" ? "All" : deckTabLabel(t)}
            </button>
          ))}
        </div>
        <div className="w-full sm:ml-auto sm:w-auto sm:min-w-72">
          <input
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {error && !showAdd && !editing && !deleting ? (
        <div className="mt-4">
          <AlertBanner variant="error">{error}</AlertBanner>
        </div>
      ) : null}

      {notice ? (
        <div className="mt-4">
          <AlertBanner variant="success">{notice}</AlertBanner>
        </div>
      ) : null}

      <main className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Loading...
          </div>
        ) : filtered.length ? (
          filtered.map((w) => (
            <div key={w.id} className="h-full min-h-0">
              <LibraryCard
                word={w}
                onEdit={openEdit}
                onDelete={(word) => setDeleting(word)}
              />
            </div>
          ))
        ) : (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            No matching cards.
          </div>
        )}
      </main>

      {showAdd ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <div className="relative w-full max-w-xl max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-5 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">Add a new card</div>
                  <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Front: word + audio. Back: meaning + example.
                  </div>
                </div>
                <button
                  className="rounded-lg px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  onClick={() => {
                    setShowAdd(false);
                    setAddImagePickerFile(null);
                  }}
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
                  <span className="text-zinc-700 dark:text-zinc-300">
                    Meaning
                  </span>
                  <textarea
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950"
                    value={meaning}
                    onChange={(e) => setMeaning(e.target.value)}
                    maxLength={400}
                    rows={3}
                  />
                </label>

                <IllustrationField
                  fieldId="add-card-illustration"
                  title="Card illustration"
                  description="Appears on the front of the card in Study. You can skip this—a default graphic is used instead."
                  previewSrc={addImagePreviewUrl}
                  disabled={saving}
                  uploading={Boolean(saving && addImageFile)}
                  error={error}
                  primaryLabel={
                    addImagePreviewUrl ? "Change image" : "Add image"
                  }
                  showClear={Boolean(addImagePreviewUrl)}
                  onSelectFile={(f) => setAddImagePickerFile(f)}
                  onClear={() => setAddImagePickerFile(null)}
                  imageFocusX={addImageFocusX}
                  imageFocusY={addImageFocusY}
                  onImageFocusChange={({ x, y }) => {
                    setAddImageFocusX(x);
                    setAddImageFocusY(y);
                  }}
                />

                <label className="block text-sm">
                  <span className="text-zinc-700 dark:text-zinc-300">
                    Example
                  </span>
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
                    onClick={() => {
                      setShowAdd(false);
                      setAddImagePickerFile(null);
                    }}
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
        </div>
      ) : null}

      {editing ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <div className="relative w-full max-w-xl max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-5 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">Edit card</div>
                  <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Changing the word regenerates pronunciation audio.
                  </div>
                </div>
                <button
                  className="rounded-lg px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  onClick={() => {
                    setEditing(null);
                    setEditImagePickerFile(null);
                    setEditImageClear(false);
                  }}
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
                  <span className="text-zinc-700 dark:text-zinc-300">
                    Meaning
                  </span>
                  <textarea
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950"
                    value={editMeaning}
                    onChange={(e) => setEditMeaning(e.target.value)}
                    maxLength={400}
                    rows={3}
                  />
                </label>

                <IllustrationField
                  fieldId="edit-card-illustration"
                  title="Card illustration"
                  previewSrc={
                    (editImagePreviewUrl ||
                      (!editImageClear ? editing.imageSrc : null)) ??
                    null
                  }
                  disabled={savingEdit}
                  uploading={Boolean(savingEdit && editImageFile)}
                  error={error}
                  notice={
                    editImageClear && editing.imagePublicId
                      ? "This illustration will be removed when you save."
                      : undefined
                  }
                  primaryLabel={
                    editImagePreviewUrl || (!editImageClear && editing.imageSrc)
                      ? "Replace"
                      : "Add image"
                  }
                  showClear={Boolean(
                    editImagePreviewUrl ||
                    (editing.imageSrc && !editImageClear),
                  )}
                  onSelectFile={(f) => setEditImagePickerFile(f)}
                  onClear={() => clearEditWordImage()}
                  imageFocusX={editImageFocusX}
                  imageFocusY={editImageFocusY}
                  onImageFocusChange={({ x, y }) => {
                    setEditImageFocusX(x);
                    setEditImageFocusY(y);
                  }}
                />

                <label className="block text-sm">
                  <span className="text-zinc-700 dark:text-zinc-300">
                    Example
                  </span>
                  <textarea
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950"
                    value={editExample}
                    onChange={(e) => setEditExample(e.target.value)}
                    maxLength={600}
                    rows={2}
                  />
                </label>

                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Pronunciation
                  </div>
                  {editing.audioSrc ? (
                    <audio
                      key={editing.audioPublicId ?? editing.audioSrc}
                      className="mt-2 w-full"
                      controls
                      src={editing.audioSrc}
                    />
                  ) : (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      No saved audio yet. Save or regenerate pronunciation.
                    </p>
                  )}
                  <button
                    type="button"
                    className="mt-3 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-950 disabled:opacity-60"
                    onClick={() => void regenerateEditPronunciation()}
                    disabled={
                      regeneratingTermAudio ||
                      savingEdit ||
                      !editTerm.trim()
                    }
                  >
                    {regeneratingTermAudio
                      ? "Regenerating..."
                      : "Regenerate pronunciation"}
                  </button>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-950"
                    onClick={() => {
                      setEditing(null);
                      setEditImagePickerFile(null);
                      setEditImageClear(false);
                    }}
                    disabled={savingEdit}
                  >
                    Cancel
                  </button>
                  <button
                    className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-950"
                    onClick={() => void saveEdit()}
                    disabled={
                      savingEdit || !editTerm.trim() || !editMeaning.trim()
                    }
                  >
                    {savingEdit ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {deleting ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <div className="relative w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-5 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
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

              {error ? (
                <AlertBanner variant="error" className="mt-4 rounded-xl p-3">
                  {error}
                </AlertBanner>
              ) : null}

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
        </div>
      ) : null}
    </div>
  );
}

function LibraryCard({
  word,
  onEdit,
  onDelete,
}: {
  word: WordCard;
  onEdit: (w: WordCard) => void;
  onDelete: (w: WordCard) => void;
}) {
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
        <svg
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path
            d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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
        <svg
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path
            d="M3 6h18M8 6V4h8v2m-1 0v14a1 1 0 01-1 1H9a1 1 0 01-1-1V6h8zM10 11v6M14 11v6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="group flex h-full min-h-88 flex-col rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
      <div className="relative shrink-0 overflow-hidden rounded-xl ring-1 ring-zinc-200/80 dark:ring-zinc-800">
        <span
          className={[
            "absolute right-2 top-2 z-10 max-w-[min(12rem,calc(100%-1rem))] truncate rounded-md border px-2 py-0.5 text-[10px] font-semibold leading-tight shadow-md backdrop-blur-[2px] sm:right-2.5 sm:top-2.5 sm:px-2.5 sm:py-1 sm:text-[11px]",
            wordBucketBadgeClass(word.bucket),
          ].join(" ")}
        >
          {wordBucketLabel(word.bucket)}
        </span>
        <WordImage
          src={word.imageSrc}
          alt=""
          objectPosition={word.imageObjectPosition}
          className="aspect-[16/10] w-full object-cover"
        />
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="w-full min-w-0">
          <div
            className={[termSize, "font-semibold tracking-tight"].join(" ")}
          >
            {word.term}
          </div>
        </div>
        {toolbar}
      </div>

      <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
        <div className="my-auto flex min-h-0 w-full flex-col gap-3">
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
      </div>

      <div className="mt-3 shrink-0">
        {word.audioSrc ? (
          <audio
            key={word.audioPublicId ?? word.audioSrc}
            className="w-full"
            controls
            src={word.audioSrc}
          />
        ) : (
          <div className="h-10" aria-hidden />
        )}
      </div>
    </div>
  );
  }
