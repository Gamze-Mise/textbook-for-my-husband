"use client";

import { useEffect } from "react";

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

export default function ThemeScript() {
  useEffect(() => {
    const stored = (localStorage.getItem(KEY) as Theme | null) ?? "system";
    applyTheme(stored);

    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;
    const onChange = () => {
      const t = (localStorage.getItem(KEY) as Theme | null) ?? "system";
      if (t === "system") applyTheme(t);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return null;
}

