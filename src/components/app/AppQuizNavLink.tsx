"use client";

import Link from "next/link";
import {
  Suspense,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { btnSecondaryCompact } from "@/components/ui/buttonClasses";

const CLOSE_DELAY_MS = 200;

const menuItemClass =
  "rounded-lg px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-900";

function subscribeHoverMediaQuery(onStoreChange: () => void) {
  const mq = window.matchMedia("(hover: hover)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={[
        "size-3.5 shrink-0 text-zinc-500 transition-transform duration-200 dark:text-zinc-400",
        open ? "rotate-180" : "",
      ].join(" ")}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.22 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function AppQuizNavLinkInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const onQuiz = pathname === "/app/quiz";
  const imagesOff = searchParams.get("images") === "0";
  const menuId = useId();

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hoverCapable = useSyncExternalStore(
    subscribeHoverMediaQuery,
    () => window.matchMedia("(hover: hover)").matches,
    () => false,
  );

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openMenu = useCallback(() => {
    clearCloseTimer();
    setOpen(true);
  }, [clearCloseTimer]);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointerDown(e: PointerEvent) {
      if (
        rootRef.current &&
        e.target instanceof Node &&
        !rootRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const hoverOpen = hoverCapable ? openMenu : undefined;
  const hoverClose = hoverCapable ? scheduleClose : undefined;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={[
          btnSecondaryCompact,
          "gap-1.5",
          onQuiz
            ? "border-zinc-300 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900"
            : "",
        ].join(" ")}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={hoverOpen}
        onMouseLeave={hoverClose}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
      >
        Quiz
        <ChevronDown open={open} />
      </button>

      <div
        id={menuId}
        role="menu"
        aria-label="Quiz mode"
        onMouseEnter={hoverOpen}
        onMouseLeave={hoverClose}
        className={[
          "absolute right-0 top-full z-50 pt-2 transition-[opacity,transform] duration-150 ease-out",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-0.5 opacity-0",
        ].join(" ")}
      >
        <div className="flex min-w-46 flex-col gap-0.5 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg ring-1 ring-black/5 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-white/10">
          <Link
            href="/app/quiz"
            role="menuitem"
            className={[
              menuItemClass,
              onQuiz && !imagesOff ? "bg-zinc-100 dark:bg-zinc-900" : "",
            ].join(" ")}
            onClick={() => setOpen(false)}
          >
            With images
          </Link>
          <Link
            href="/app/quiz?images=0"
            role="menuitem"
            className={[
              menuItemClass,
              onQuiz && imagesOff ? "bg-zinc-100 dark:bg-zinc-900" : "",
            ].join(" ")}
            onClick={() => setOpen(false)}
          >
            Without images
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AppQuizNavLink() {
  return (
    <Suspense
      fallback={
        <Link href="/app/quiz" className={btnSecondaryCompact}>
          Quiz
        </Link>
      }
    >
      <AppQuizNavLinkInner />
    </Suspense>
  );
}
