import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import LogoMark from "@/components/LogoMark";
import ThemeToggle from "@/components/ThemeToggle";
import { btnPrimary, btnSecondary } from "@/components/ui/buttonClasses";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Page not found",
};

const quickLinks = [
  { href: "/app", label: "Library" },
  { href: "/app/study", label: "Study" },
  { href: "/app/quiz", label: "Quiz" },
] as const;

function MissingCardVisual() {
  return (
    <div className="relative mx-auto min-h-72 w-full max-w-md px-4 sm:px-0" aria-hidden>
      <div className="absolute left-1/2 top-8 h-52 w-40 -translate-x-[calc(50%+2.75rem)] -rotate-10 rounded-2xl border border-zinc-200/70 bg-white/50 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/40" />
      <div className="absolute left-1/2 top-8 h-52 w-40 -translate-x-[calc(50%-2.75rem)] rotate-10 rounded-2xl border border-zinc-200/70 bg-white/50 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/40" />

      <div className="relative mx-auto flex h-64 w-44 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg ring-1 ring-zinc-900/5 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/10">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 border-b border-dashed border-zinc-200 bg-linear-to-b from-zinc-50 to-white px-4 dark:border-zinc-800 dark:from-zinc-900/60 dark:to-zinc-950">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-100/80 dark:border-zinc-700 dark:bg-zinc-900/80">
            <svg
              className="size-7 text-zinc-400 dark:text-zinc-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            Missing card
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 px-4 py-5">
          <p className="text-4xl font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
            404
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Not found</p>
        </div>
      </div>
    </div>
  );
}

export default async function NotFound() {
  const session = await getServerSession(authOptions);
  const signedIn = Boolean(session?.user?.id);

  return (
    <div className="relative min-h-svh bg-zinc-50 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden
        style={{
          background:
            "radial-gradient(1000px 520px at 12% -5%, rgba(99,102,241,.16), transparent 55%), radial-gradient(900px 480px at 92% 8%, rgba(236,72,153,.13), transparent 52%), radial-gradient(600px 320px at 50% 100%, rgba(24,24,27,.04), transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(161,161,170,.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(161,161,170,.18) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black, transparent)",
        }}
      />

      <div className="relative mx-auto flex min-h-svh w-full max-w-6xl flex-col px-6 py-8 sm:px-8 sm:py-10">
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl transition hover:opacity-90"
          >
            <LogoMark />
            <span className="text-sm font-semibold tracking-tight">Vocabulary</span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {signedIn ? (
              <Link href="/app" className={`${btnSecondary} hidden sm:inline-flex`}>
                Library
              </Link>
            ) : (
              <>
                <Link href="/login" className={`${btnSecondary} hidden sm:inline-flex`}>
                  Sign in
                </Link>
                <Link href="/register" className={`${btnPrimary} hidden sm:inline-flex`}>
                  Get started
                </Link>
              </>
            )}
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center py-10 lg:py-16">
          <div className="grid w-full max-w-4xl items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
            <MissingCardVisual />

            <div className="text-center lg:text-left">
              <p className="inline-flex items-center rounded-full border border-zinc-200/80 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-400">
                Page not found
              </p>

              <h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                This page isn&apos;t in your deck.
              </h1>

              <p className="mx-auto mt-4 max-w-md text-pretty text-base leading-relaxed text-zinc-600 dark:text-zinc-400 lg:mx-0">
                {signedIn
                  ? "The URL may be mistyped, expired, or removed. Pick a destination below to get back to your vocabulary practice."
                  : "The URL may be mistyped or no longer available. Return home, or sign in to open your personal library."}
              </p>

              <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row lg:justify-start">
                {signedIn ? (
                  <>
                    <Link href="/app" className={btnPrimary}>
                      Go to library
                    </Link>
                    <Link href="/" className={btnSecondary}>
                      Back to home
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/" className={btnPrimary}>
                      Back to home
                    </Link>
                    <Link href="/login" className={btnSecondary}>
                      Sign in
                    </Link>
                  </>
                )}
              </div>

              {signedIn ? (
                <nav
                  aria-label="Quick links"
                  className="mt-8 flex flex-wrap items-center justify-center gap-x-1 gap-y-2 text-sm lg:justify-start"
                >
                  <span className="mr-2 text-zinc-500 dark:text-zinc-400">Jump to</span>
                  {quickLinks.map((item, index) => (
                    <span key={item.href} className="inline-flex items-center">
                      {index > 0 ? (
                        <span className="mx-2 text-zinc-300 dark:text-zinc-700" aria-hidden>
                          ·
                        </span>
                      ) : null}
                      <Link
                        href={item.href}
                        className="font-medium text-zinc-700 underline-offset-4 transition hover:text-zinc-950 hover:underline dark:text-zinc-300 dark:hover:text-zinc-50"
                      >
                        {item.label}
                      </Link>
                    </span>
                  ))}
                </nav>
              ) : null}
            </div>
          </div>
        </main>

        <footer className="border-t border-zinc-200/80 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <p>
            {signedIn
              ? "Need help? Check the URL or return to your library."
              : "Private vocabulary deck · Study · Quiz"}
          </p>
        </footer>
      </div>
    </div>
  );
}
