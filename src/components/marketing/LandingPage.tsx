"use client";

import Link from "next/link";
import LogoMark from "@/components/LogoMark";
import ThemeToggle from "@/components/ThemeToggle";
import LandingAppPreview from "@/components/marketing/LandingAppPreview";

const linkSecondary =
  "inline-flex cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900";

const linkPrimary =
  "inline-flex cursor-pointer items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200";

const highlights = [
  { title: "Library", text: "Cards with image, audio, meaning, and examples." },
  { title: "Study", text: "Flip, listen, mark Got it or Again." },
  { title: "Quiz", text: "Fresh rounds weighted toward words you miss." },
] as const;

export default function LandingPage() {
  return (
    <div className="relative min-h-svh bg-zinc-50 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        aria-hidden
        style={{
          background:
            "radial-gradient(1000px 500px at 15% 0%, rgba(99,102,241,.14), transparent 55%), radial-gradient(800px 400px at 90% 10%, rgba(236,72,153,.12), transparent 50%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-8 sm:px-8 sm:py-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogoMark />
            <span className="text-sm font-semibold tracking-tight">Flashcards</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link className={`${linkSecondary} hidden sm:inline-flex`} href="/login">
              Sign in
            </Link>
            <Link className={linkPrimary} href="/register">
              Get started
            </Link>
          </div>
        </header>

        <main className="mt-12 lg:mt-16">
          <section className="mx-auto max-w-2xl text-center lg:max-w-3xl">
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Vocabulary practice,{" "}
              <span className="text-zinc-500 dark:text-zinc-400">built like the app inside</span>
            </h1>
            <p className="mt-4 text-pretty text-lg text-zinc-600 dark:text-zinc-400">
              Private deck · auto audio · study & quiz — no clutter.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
              <Link className={linkPrimary} href="/register">
                Create account
              </Link>
              <Link className={linkSecondary} href="/login">
                Sign in
              </Link>
            </div>
          </section>

          <section className="mt-12 lg:mt-14">
            <LandingAppPreview />
          </section>

          <section className="mt-14 grid gap-4 sm:grid-cols-3 lg:mt-16">
            {highlights.map((h) => (
              <article
                key={h.title}
                className="rounded-2xl border border-zinc-200/80 bg-white/70 p-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/50"
              >
                <h2 className="text-sm font-semibold">{h.title}</h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{h.text}</p>
              </article>
            ))}
          </section>
        </main>

        <footer className="mt-16 border-t border-zinc-200/80 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
          <p>Private account · Email verification · Light / dark theme</p>
        </footer>
      </div>
    </div>
  );
}
