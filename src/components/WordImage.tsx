"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  /** CSS `object-position` when using `object-cover` (e.g. `"50% 15%"`). */
  objectPosition?: string | null;
  /** Low-quality blurred placeholder first, then full image. */
  placeholder?: "blur";
  loading?: "eager" | "lazy";
  decoding?: "async" | "sync" | "auto";
  fetchPriority?: "high" | "low" | "auto";
};

function cloudinaryBlurPlaceholderUrl(src: string): string | null {
  if (!src.includes("res.cloudinary.com")) return null;
  const marker = "/upload/";
  const i = src.indexOf(marker);
  if (i < 0) return null;
  const head = src.slice(0, i + marker.length);
  const tail = src.slice(i + marker.length);
  if (!tail) return null;
  const transform = "f_auto,q_1,e_blur:200,w_80";
  return `${head}${transform}/${tail}`;
}

function PlaceholderGraphic({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 50"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      focusable="false"
    >
      <rect width="80" height="50" className="fill-stone-100 dark:fill-zinc-950" rx="4" />
      <ellipse
        cx="58"
        cy="11"
        rx="26"
        ry="16"
        className="fill-violet-200/55 dark:fill-violet-600/25"
      />
      <ellipse
        cx="14"
        cy="42"
        rx="20"
        ry="12"
        className="fill-amber-200/60 dark:fill-amber-600/20"
      />
      <rect
        x="29"
        y="12"
        width="30"
        height="22"
        rx="3"
        className="fill-stone-300/90 dark:fill-zinc-700"
      />
      <rect
        x="22"
        y="9"
        width="34"
        height="26"
        rx="3.5"
        className="fill-white dark:fill-zinc-800 stroke-stone-200 dark:stroke-zinc-600"
        strokeWidth="1.25"
      />
      <rect x="28" y="16" width="22" height="2.2" rx="1.1" className="fill-stone-400 dark:fill-zinc-500" />
      <rect x="28" y="21" width="18" height="1.6" rx="0.8" className="fill-stone-300 dark:fill-zinc-600" />
      <rect x="28" y="25" width="14" height="1.6" rx="0.8" className="fill-stone-300 dark:fill-zinc-600" />
      <rect x="28" y="29" width="20" height="1.6" rx="0.8" className="fill-stone-200 dark:fill-zinc-700" />
    </svg>
  );
}

/**
 * Word illustration: missing URL or load error → inline placeholder (theme-aware).
 * Remote URLs use a plain img (Cloudinary and blob previews); Next/Image is not used here.
 */
export default function WordImage({
  src,
  alt,
  className,
  objectPosition,
  placeholder,
  loading,
  decoding = "async",
  fetchPriority,
}: Props) {
  const desiredSrc = (src ?? "").trim();
  const [failedForUrl, setFailedForUrl] = useState<string | null>(null);

  const effectiveSrc = desiredSrc;
  const blurCandidate = useMemo(() => {
    if (placeholder !== "blur") return null;
    if (!effectiveSrc || effectiveSrc.startsWith("blob:")) return null;
    return cloudinaryBlurPlaceholderUrl(effectiveSrc);
  }, [effectiveSrc, placeholder]);

  const [fullReadyFor, setFullReadyFor] = useState<string | null>(null);
  const fullReady = fullReadyFor === effectiveSrc;

  useEffect(() => {
    if (placeholder !== "blur") return;
    if (!effectiveSrc || effectiveSrc.startsWith("blob:")) return;
    if (fullReadyFor === effectiveSrc) return;

    let cancelled = false;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (cancelled) return;
      setFullReadyFor(effectiveSrc);
    };
    img.onerror = () => {
      if (cancelled) return;
      setFullReadyFor(effectiveSrc);
    };
    img.src = effectiveSrc;
    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [effectiveSrc, fullReadyFor, placeholder]);

  const renderSrc =
    placeholder === "blur" && blurCandidate && !fullReady ? blurCandidate : effectiveSrc;
  const loadFailed = Boolean(effectiveSrc && failedForUrl === effectiveSrc);
  const style = useMemo(
    () => (objectPosition ? { objectPosition } : undefined),
    [objectPosition],
  );

  if (!renderSrc || loadFailed) {
    return <PlaceholderGraphic className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- Cloudinary + blob previews
    <img
      src={renderSrc}
      alt={alt}
      className={className}
      style={style}
      loading={loading ?? (renderSrc.startsWith("blob:") ? "eager" : "lazy")}
      decoding={decoding}
      fetchPriority={fetchPriority}
      draggable={false}
      onError={() => setFailedForUrl(effectiveSrc)}
    />
  );
}
