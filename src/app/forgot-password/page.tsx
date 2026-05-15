"use client";

import Link from "next/link";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const json = (await res.json().catch(() => null)) as
        | { error: string }
        | null;
      setError(json?.error ?? "Something went wrong.");
      setStatus("idle");
      return;
    }

    setStatus("sent");
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
              Reset your password
            </h1>
          </div>
        </div>

        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          We&apos;ll email you a reset link if the account exists.
        </p>

        {status === "sent" ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100">
            If the account exists, a reset link has been sent.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">Email</span>
              <input
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            {error ? (
              <div className="text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            ) : null}

            <button
              className="w-full rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-950"
              disabled={status === "loading"}
              type="submit"
            >
              {status === "loading" ? "Sending..." : "Send reset email"}
            </button>
          </form>
        )}

        <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
          <Link className="underline" href="/login">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

