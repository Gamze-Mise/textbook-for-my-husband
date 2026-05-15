"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import LogoMark from "@/components/LogoMark";

export default function LoginClient() {
  const [callbackUrl] = useState(() => {
    if (typeof window === "undefined") return "/app";
    const sp = new URLSearchParams(window.location.search);
    return sp.get("callbackUrl") ?? "/app";
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function friendlyError(code: string | null | undefined) {
    switch (code) {
      case "ACCOUNT_NOT_FOUND":
        return "No account found for this email. Create an account to get started.";
      case "EMAIL_NOT_VERIFIED":
        return "Please verify your email before signing in.";
      case "INVALID_CREDENTIALS":
      case "CredentialsSignin":
        return "Incorrect email or password.";
      default:
        return "Couldn’t sign you in. Please try again.";
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: false,
    });

    setLoading(false);

    if (!res || res.error) {
      setError(friendlyError(res?.error));
      return;
    }

    const target = res.url && !res.url.includes("/login") ? res.url : callbackUrl;
    window.location.href = target;
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
              Welcome back
            </h1>
          </div>
        </div>
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Sign in to your account.
        </p>

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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon open={showPassword} />
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
            disabled={loading}
            type="submit"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
          <Link className="underline" href="/forgot-password">
            Forgot password?
          </Link>
          <Link className="underline" href="/register">
            Create account
          </Link>
        </div>

        <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
          <Link className="underline" href="/">
            Back to home
          </Link>
        </div>
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

