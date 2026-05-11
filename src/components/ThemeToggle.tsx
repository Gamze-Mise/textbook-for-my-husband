"use client";

import { useEffect, useState } from "react";

const KEY = "theme";
type Theme = "light" | "dark" | "system";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const systemDark =
    window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  const effective = theme === "system" ? (systemDark ? "dark" : "light") : theme;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", effective);
  root.classList.toggle("dark", effective === "dark");
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    const stored = localStorage.getItem(KEY) as Theme | null;
    return stored ?? "system";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function set(next: Theme) {
    setTheme(next);
    localStorage.setItem(KEY, next);
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 text-xs dark:border-zinc-800 dark:bg-zinc-950">
      <button
        type="button"
        className={[
          "rounded-lg px-2 py-1",
          theme === "light"
            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
            : "text-zinc-700 dark:text-zinc-300",
        ].join(" ")}
        onClick={() => set("light")}
      >
        Light
      </button>
      <button
        type="button"
        className={[
          "rounded-lg px-2 py-1",
          theme === "dark"
            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
            : "text-zinc-700 dark:text-zinc-300",
        ].join(" ")}
        onClick={() => set("dark")}
      >
        Dark
      </button>
      <button
        type="button"
        className={[
          "rounded-lg px-2 py-1",
          theme === "system"
            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
            : "text-zinc-700 dark:text-zinc-300",
        ].join(" ")}
        onClick={() => set("system")}
      >
        System
      </button>
    </div>
  );
}

