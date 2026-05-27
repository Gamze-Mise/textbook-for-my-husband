"use client";

import { useEffect } from "react";
import WordImage from "@/components/WordImage";

type Props = {
  open: boolean;
  onClose: () => void;
  src?: string | null;
  objectPosition?: string;
  ariaLabel?: string;
};

export default function WordImageFullscreenOverlay({
  open,
  onClose,
  src,
  objectPosition,
  ariaLabel = "Full screen image",
}: Props) {
  const hasImage = Boolean(src?.trim());

  useEffect(() => {
    if (!open || !hasImage) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [hasImage, onClose, open]);

  if (!open || !hasImage) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/25 backdrop-blur-md dark:bg-black/40"
        onClick={onClose}
        aria-label="Close full screen image"
      />
      <button
        type="button"
        className="absolute right-3 top-3 z-10 inline-flex size-10 items-center justify-center rounded-lg border border-zinc-200/80 bg-white/90 text-zinc-800 shadow-sm backdrop-blur-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus-visible:ring-zinc-500 sm:right-4 sm:top-4"
        onClick={onClose}
        aria-label="Close"
      >
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>
      <div className="pointer-events-none relative z-10 flex min-h-0 flex-1 items-center justify-center p-4 pt-14 sm:p-6 sm:pt-16">
        <WordImage
          src={src}
          alt=""
          objectPosition={objectPosition}
          placeholder="blur"
          loading="eager"
          fetchPriority="high"
          className="max-h-full max-w-full object-contain drop-shadow-lg"
        />
      </div>
    </div>
  );
}
