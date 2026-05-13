import Link from "next/link";
import LogoMark from "@/components/LogoMark";

export default function Home() {
  return (
    <div className="relative flex min-h-svh items-center justify-center bg-zinc-50 px-6 py-14 font-sans dark:bg-black">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden
        style={{
          background:
            "radial-gradient(1200px 600px at 20% 10%, rgba(99,102,241,.18), transparent 60%), radial-gradient(900px 500px at 85% 15%, rgba(236,72,153,.16), transparent 55%), radial-gradient(900px 500px at 55% 90%, rgba(16,185,129,.12), transparent 55%)",
        }}
      />

      <main className="relative w-full max-w-5xl">
        <div className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/60 sm:p-10">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <LogoMark />
              <div className="flex flex-col">
                <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Flashcards
                </div>
                <div className="text-base font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                  Personal vocabulary trainer
                </div>
              </div>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <Link
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
                href="/login"
              >
                Sign in
              </Link>
              <Link
                className="rounded-xl bg-linear-to-r from-indigo-600 to-pink-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-indigo-500 hover:to-pink-500"
                href="/register"
              >
                Create account
              </Link>
            </div>
          </header>

          <div className="mt-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div>
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-5xl">
                Make vocabulary practice feel easy
              </h1>
              <p className="mt-4 max-w-xl text-pretty text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                Save words you actually meet, hear the pronunciation, and review
                in short sessions. Clean design, fast flow, and your progress
                stays private.
              </p>

              <div className="mt-6 space-y-3 text-sm text-zinc-700 dark:text-zinc-200">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex size-6 items-center justify-center rounded-full bg-indigo-600/10 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200">
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                    >
                      <path
                        d="M20 6L9 17l-5-5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">
                      Instant pronunciation
                    </div>
                    <div className="mt-0.5 text-zinc-600 dark:text-zinc-400">
                      Audio is generated automatically for each word.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex size-6 items-center justify-center rounded-full bg-pink-600/10 text-pink-700 dark:bg-pink-500/15 dark:text-pink-200">
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                    >
                      <path
                        d="M12 21s-8-4.5-8-11a4.5 4.5 0 018-2 4.5 4.5 0 018 2c0 6.5-8 11-8 11z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">
                      Study without friction
                    </div>
                    <div className="mt-0.5 text-zinc-600 dark:text-zinc-400">
                      One tap to flip, one tap to mark your answer.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex size-6 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                    >
                      <path
                        d="M12 3v18M3 12h18"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">
                      Simple, private, yours
                    </div>
                    <div className="mt-0.5 text-zinc-600 dark:text-zinc-400">
                      Verified email sign-in and a clean library.
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-2 sm:hidden">
                <Link
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-center text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
                  href="/login"
                >
                  Sign in
                </Link>
                <Link
                  className="w-full rounded-xl bg-linear-to-r from-indigo-600 to-pink-600 px-4 py-3 text-center text-sm font-medium text-white shadow-sm transition hover:from-indigo-500 hover:to-pink-500"
                  href="/register"
                >
                  Create account
                </Link>
              </div>
            </div>

            <div className="relative">
              <div
                className="pointer-events-none absolute -inset-4 -z-10 rounded-4xl opacity-70 blur-2xl"
                aria-hidden
                style={{
                  background:
                    "radial-gradient(500px 260px at 40% 25%, rgba(99,102,241,.25), transparent 60%), radial-gradient(420px 240px at 70% 65%, rgba(236,72,153,.18), transparent 60%)",
                }}
              />

              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Preview
                </div>

                <div className="mt-4 grid gap-3">
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          Library
                        </div>
                        <div className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                          curious
                        </div>
                        <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                          eager to know or learn
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200">
                        <span className="size-1.5 rounded-full bg-pink-500" />
                        Needs review
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex size-9 items-center justify-center rounded-full bg-linear-to-r from-indigo-600 to-pink-600 text-white">
                          <svg
                            className="size-4"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path d="M8 5v14l11-7z" fill="currentColor" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex h-2 items-center gap-1">
                            <div className="h-2 w-6 rounded bg-zinc-300/70 dark:bg-zinc-700/70" />
                            <div className="h-2 w-10 rounded bg-zinc-300/70 dark:bg-zinc-700/70" />
                            <div className="h-2 w-4 rounded bg-zinc-300/70 dark:bg-zinc-700/70" />
                            <div className="h-2 w-8 rounded bg-zinc-300/70 dark:bg-zinc-700/70" />
                            <div className="h-2 w-5 rounded bg-zinc-300/70 dark:bg-zinc-700/70" />
                          </div>
                          <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
                            <div className="h-1.5 w-1/3 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <div className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-center text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                        Got it
                      </div>
                      <div className="flex-1 rounded-xl bg-zinc-900 px-3 py-2 text-center text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-950">
                        Again
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Study
                    </div>
                    <div className="mt-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
                      <div className="text-center">
                        <div className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                          brave
                        </div>
                        <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                          tap to flip
                        </div>
                      </div>
                      <div className="mt-4 h-10 w-full rounded-xl border border-zinc-200 bg-white/70 dark:border-zinc-800 dark:bg-zinc-950/60" />
                      <div className="mt-4 flex gap-2">
                        <div className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-center text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                          Got it
                        </div>
                        <div className="flex-1 rounded-xl bg-zinc-900 px-3 py-2 text-center text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-950">
                          Again
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
                  Start with a few words — you&apos;ll feel progress quickly.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-zinc-200/70 pt-8 dark:border-zinc-800/70">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  How it works
                </div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  A simple loop you can stick with.
                </div>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Built for short daily sessions
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  <span className="inline-flex size-8 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200">
                    1
                  </span>
                  Add words
                </div>
                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Save the words you actually meet — meaning and an example
                  included.
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  <span className="inline-flex size-8 items-center justify-center rounded-xl bg-pink-600/10 text-pink-700 dark:bg-pink-500/15 dark:text-pink-200">
                    2
                  </span>
                  Listen
                </div>
                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Tap play to hear pronunciation whenever you need it.
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  <span className="inline-flex size-8 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
                    3
                  </span>
                  Review
                </div>
                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Quick answers keep your deck focused on what you need most.
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Email verification
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                <span className="size-1.5 rounded-full bg-indigo-500" />
                Light/Dark/System
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                <span className="size-1.5 rounded-full bg-pink-500" />
                Mobile friendly
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
