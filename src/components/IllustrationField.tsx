"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import WordImage from "@/components/WordImage";
import { validateWordImageFile, WORD_IMAGE_ACCEPT_ATTR } from "@/lib/wordImageConstraints";

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7.5 12.5 10 10l2.5 2.5L16 9l4.5 4.5" />
      <circle cx="8.5" cy="8.5" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

const LOCAL_ERROR_MS = 3500;

export type IllustrationFieldProps = {
  fieldId: string;
  title: string;
  description: string;
  previewSrc: string | null;
  disabled: boolean;
  uploading: boolean;
  error: string | null;
  notice?: ReactNode;
  primaryLabel: string;
  showClear: boolean;
  onSelectFile: (file: File) => void;
  onClear?: () => void;
};

export default function IllustrationField({
  fieldId,
  title,
  description,
  previewSrc,
  disabled,
  uploading,
  error,
  notice,
  primaryLabel,
  showClear,
  onSelectFile,
  onClear,
}: IllustrationFieldProps) {
  const reactId = useId();
  const labelId = `${fieldId}-${reactId}-label`;
  const hintId = `${fieldId}-${reactId}-hint`;
  const errorId = `${fieldId}-${reactId}-error`;

  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const localErrorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasPreview = Boolean((previewSrc ?? "").trim());
  const displayError = localError || error;

  const clearLocalErrorTimer = useCallback(() => {
    if (localErrorTimerRef.current) {
      clearTimeout(localErrorTimerRef.current);
      localErrorTimerRef.current = null;
    }
  }, []);

  const scheduleLocalErrorClear = useCallback(() => {
    clearLocalErrorTimer();
    localErrorTimerRef.current = setTimeout(() => {
      localErrorTimerRef.current = null;
      setLocalError(null);
    }, LOCAL_ERROR_MS);
  }, [clearLocalErrorTimer]);

  useEffect(() => {
    return () => clearLocalErrorTimer();
  }, [clearLocalErrorTimer]);

  const tryAcceptFile = useCallback(
    (file: File | null) => {
      if (!file) return;
      const err = validateWordImageFile(file);
      if (err) {
        setLocalError(err);
        scheduleLocalErrorClear();
        return;
      }
      clearLocalErrorTimer();
      setLocalError(null);
      onSelectFile(file);
    },
    [onSelectFile, scheduleLocalErrorClear, clearLocalErrorTimer],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      tryAcceptFile(e.dataTransfer.files?.[0] ?? null);
    },
    [disabled, tryAcceptFile],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  }, [disabled]);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOver(false);
    }
  }, []);

  const shellClass = [
    "overflow-hidden rounded-2xl border transition-[border-color,box-shadow,background-color]",
    displayError
      ? "border-red-300/90 bg-red-50/30 shadow-[inset_0_0_0_1px_rgba(248,113,113,0.12)] dark:border-red-900/45 dark:bg-red-950/15"
      : dragOver
        ? "border-zinc-900/25 bg-violet-50/40 shadow-sm ring-2 ring-violet-500/20 dark:border-zinc-100/20 dark:bg-violet-950/20 dark:ring-violet-400/15"
        : hasPreview
          ? "border-zinc-200/90 bg-zinc-50/80 dark:border-zinc-700/90 dark:bg-zinc-900/35"
          : "border-dashed border-zinc-300/95 bg-zinc-50/60 dark:border-zinc-600 dark:bg-zinc-900/25",
  ].join(" ");

  return (
    <div
      className="space-y-2"
      role="group"
      aria-labelledby={labelId}
      aria-describedby={
        [hintId, displayError ? errorId : null].filter(Boolean).join(" ") || undefined
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <div
            id={labelId}
            className="text-sm font-medium text-zinc-800 dark:text-zinc-100"
          >
            {title}
          </div>
          <p
            id={hintId}
            className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400"
          >
            {description}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          Optional
        </span>
      </div>

      <div
        className={shellClass}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        {hasPreview ? (
          <>
            <div className="p-2 sm:p-2.5">
              <div className="relative overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-black/4 dark:bg-zinc-950 dark:ring-white/10">
                <div className="relative aspect-16/10 w-full">
                  <WordImage
                    src={previewSrc}
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                  />
                  {localError ? (
                    <div
                      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-red-950/55 px-4 text-center backdrop-blur-[2px] dark:bg-red-950/70"
                      aria-live="assertive"
                    >
                      <div
                        className="flex size-11 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/80 dark:text-red-200"
                        aria-hidden
                      >
                        <svg className="size-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 border-t border-zinc-200/80 px-3 py-3 dark:border-zinc-700/80 sm:flex-row sm:items-center sm:justify-between sm:px-4">
              {uploading ? (
                <div className="flex w-full items-center justify-center gap-2 py-1 sm:justify-start">
                  <div
                    className="size-5 shrink-0 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-zinc-100"
                    role="presentation"
                  />
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                    Uploading…
                  </span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] leading-snug text-zinc-400 dark:text-zinc-500 sm:max-w-[55%]">
                    JPEG · PNG · WebP · max 2 MB
                  </p>
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                    <label
                      className={[
                        "inline-flex cursor-pointer items-center justify-center rounded-xl px-3.5 py-2 text-xs font-semibold transition",
                        disabled
                          ? "pointer-events-none opacity-50"
                          : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white",
                      ].join(" ")}
                    >
                      <input
                        type="file"
                        accept={WORD_IMAGE_ACCEPT_ATTR}
                        className="sr-only"
                        disabled={disabled}
                        onChange={(e) => {
                          const raw = e.target.files?.[0] ?? null;
                          e.target.value = "";
                          tryAcceptFile(raw);
                        }}
                      />
                      {primaryLabel}
                    </label>
                    {showClear && onClear ? (
                      <button
                        type="button"
                        className="rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
                        disabled={disabled}
                        onClick={onClear}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="relative px-4 py-8 sm:px-6 sm:py-10">
            <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:gap-5 sm:text-left">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                <ImageIcon className="size-6" />
              </div>
              <div className="mt-4 min-w-0 flex-1 sm:mt-0">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                  Drop an image here, or browse
                </p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  JPEG · PNG · WebP · max 2 MB. Used on the card front in study mode.
                </p>
                {notice ? (
                  <div className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-left text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/35 dark:text-amber-100/95">
                    {notice}
                  </div>
                ) : null}
              </div>
              <div className="mt-5 flex w-full shrink-0 flex-col gap-2 sm:mt-0 sm:w-auto sm:min-w-34">
                <label
                  className={[
                    "inline-flex w-full cursor-pointer items-center justify-center rounded-xl px-4 py-2.5 text-xs font-semibold transition",
                    disabled
                      ? "pointer-events-none opacity-50"
                      : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white",
                  ].join(" ")}
                >
                  <input
                    type="file"
                    accept={WORD_IMAGE_ACCEPT_ATTR}
                    className="sr-only"
                    disabled={disabled}
                    onChange={(e) => {
                      const raw = e.target.files?.[0] ?? null;
                      e.target.value = "";
                      tryAcceptFile(raw);
                    }}
                  />
                  {primaryLabel}
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {displayError ? (
        <div
          id={errorId}
          role="alert"
          className="flex gap-2 rounded-xl border border-red-200 bg-red-50/95 px-3 py-2.5 text-sm text-red-900 dark:border-red-900/45 dark:bg-red-950/40 dark:text-red-100"
        >
          <span className="mt-0.5 shrink-0 text-red-600 dark:text-red-400" aria-hidden>
            <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM7.25 4.75h1.5v4.5h-1.5v-4.5Zm1.5 6.75h-1.5v-1.5h1.5v1.5Z" />
            </svg>
          </span>
          <span className="min-w-0 leading-snug">{displayError}</span>
        </div>
      ) : null}
    </div>
  );
}
