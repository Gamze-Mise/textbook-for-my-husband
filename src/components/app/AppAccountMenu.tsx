"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";

export default function AppAccountMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (!open) return;
      if (!ref.current) return;
      if (e.target instanceof Node && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  const email = session?.user?.email ?? "Account";
  const initial = (session?.user?.email?.[0] ?? "U").toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="inline-flex size-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-sm font-semibold dark:border-zinc-800 dark:bg-zinc-950"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        title={email}
      >
        {initial}
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          <div className="px-2 pb-2">
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Signed in as
            </div>
            <div className="truncate text-sm font-medium">{email}</div>
          </div>
          <div className="px-2 py-2">
            <ThemeToggle />
          </div>
          <button
            type="button"
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-950"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
