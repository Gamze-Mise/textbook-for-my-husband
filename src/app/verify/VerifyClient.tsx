"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function VerifyClient() {
  const [email] = useState(() => {
    if (typeof window === "undefined") return "";
    const sp = new URLSearchParams(window.location.search);
    return sp.get("email") ?? "";
  });
  const [token] = useState(() => {
    if (typeof window === "undefined") return "";
    const sp = new URLSearchParams(window.location.search);
    return sp.get("token") ?? "";
  });

  const [state, setState] = useState<
    "idle" | "verifying" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const ready = useMemo(() => Boolean(email && token), [email, token]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;

    async function run() {
      setState("verifying");
      setError(null);

      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, token }),
      });
      const rawText = await res.text().catch(() => "");
      const json = (() => {
        try {
          return JSON.parse(rawText) as { ok: true } | { error: string };
        } catch {
          return null;
        }
      })();

      if (cancelled) return;

      if (!res.ok || !json || ("error" in json && json.error)) {
        setState("error");
        setError(
          json && "error" in json
            ? json.error
            : `Verification failed (HTTP ${res.status}).`,
        );
        return;
      }

      setState("success");
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [email, token, ready]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-zinc-50 p-6 dark:bg-black">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Email verification</h1>

        {!ready ? (
          <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
            The link is missing or invalid.
          </div>
        ) : state === "verifying" ? (
          <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
            Verifying...
          </div>
        ) : state === "success" ? (
          <div className="mt-6 space-y-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100">
              Your account is now active.
            </div>
            <Link
              className="inline-flex rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-950"
              href="/login"
            >
              Sign in
            </Link>
          </div>
        ) : state === "error" ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100">
            {error ?? "Something went wrong."}
          </div>
        ) : null}
      </div>
    </div>
  );
}

