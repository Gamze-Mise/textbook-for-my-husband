"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

export default function ResetPasswordClient() {
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

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [show, setShow] = useState(false);

  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const ready = useMemo(() => Boolean(email && token), [email, token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== password2) {
      setError("Passwords do not match.");
      return;
    }
    setStatus("loading");
    setError(null);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, token, password }),
    });

    const json = (await res.json().catch(() => null)) as
      | { ok: true }
      | { error: string }
      | null;

    if (!res.ok || !json || "error" in json) {
      setStatus("idle");
      setError(json && "error" in json ? json.error : "Something went wrong.");
      return;
    }

    setStatus("done");
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-zinc-50 p-6 dark:bg-black">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-zinc-900 dark:bg-zinc-100" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Vocabulary
            </span>
            <h1 className="text-2xl font-semibold tracking-tight">
              Choose a new password
            </h1>
          </div>
        </div>

        {!ready ? (
          <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
            The link is missing or invalid.
          </div>
        ) : status === "done" ? (
          <div className="mt-6 space-y-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100">
              Password updated. You can sign in now.
            </div>
            <Link
              className="inline-flex rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-950"
              href="/login"
            >
              Sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">
                New password
              </span>
              <div className="mt-1 relative">
                <input
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 pr-11 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950"
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Hide password" : "Show password"}
                  title={show ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={show} />
                </button>
              </div>
            </label>

            <label className="block text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">
                Confirm new password
              </span>
              <div className="mt-1 relative">
                <input
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 pr-11 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950"
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Hide password" : "Show password"}
                  title={show ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={show} />
                </button>
              </div>
            </label>

            {error ? (
              <div className="text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            ) : null}

            <button
              className="w-full rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-950"
              disabled={status === "loading" || password !== password2}
              type="submit"
            >
              {status === "loading" ? "Updating..." : "Update password"}
            </button>

            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              <Link className="underline" href="/login">
                Back to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 4.2A10.6 10.6 0 0 1 12 4c6.5 0 10 8 10 8a18 18 0 0 1-3.3 4.6" />
      <path d="M6.1 6.1A18 18 0 0 0 2 12s3.5 8 10 8c1.2 0 2.3-.2 3.3-.6" />
      <path d="M2 2l20 20" />
    </svg>
  );
}

