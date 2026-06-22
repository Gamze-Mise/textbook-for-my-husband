"use client";

import Link from "next/link";
import { useState } from "react";
import LogoMark from "@/components/LogoMark";

export default function HomeLogoLink() {
  const [loading, setLoading] = useState(false);

  return (
    <Link
      href="/"
      aria-label="Back to home"
      onClick={() => setLoading(true)}
      className="relative inline-flex shrink-0 rounded-xl outline-none transition focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500"
    >
      <LogoMark className={loading ? "opacity-40" : ""} />
      {loading ? (
        <span
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <span className="size-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-800 dark:border-zinc-600 dark:border-t-zinc-200" />
        </span>
      ) : null}
    </Link>
  );
}
