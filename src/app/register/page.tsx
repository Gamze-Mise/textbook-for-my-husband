"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import LogoMark from "@/components/LogoMark";
import PasswordVisibilityIcon from "@/components/PasswordVisibilityIcon";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "sent" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== password2) {
      setStatus("error");
      setError("Passwords do not match.");
      return;
    }

    setStatus("loading");
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json = (await res.json().catch(() => null)) as
      | { ok: true }
      | { error: string }
      | null;

    if (!res.ok || !json || "error" in json) {
      setStatus("error");
      setError(json && "error" in json ? json.error : "Something went wrong.");
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
          <LogoMark />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Vocabulary
            </span>
            <h1 className="text-2xl font-semibold tracking-tight">
              Create your account
            </h1>
          </div>
        </div>
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          We&apos;ll email you a verification link before your account is created.
        </p>

        {status === "sent" ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100">
            Verification email sent. Open the link to finish creating your account.
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
            <label className="block text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">Password</span>
              <div className="mt-1 relative">
                <input
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 pr-11 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  <PasswordVisibilityIcon open={showPassword} />
                </button>
              </div>
            </label>
            <label className="block text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">
                Confirm password
              </span>
              <div className="mt-1 relative">
                <input
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 pr-11 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  <PasswordVisibilityIcon open={showPassword} />
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
              disabled={status === "loading"}
              type="submit"
            >
              {status === "loading" ? "Sending..." : "Send verification email"}
            </button>
          </form>
        )}

        <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link className="underline" href="/login">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

