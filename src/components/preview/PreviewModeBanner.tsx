function PreviewIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function PreviewModeBanner() {
  return (
    <div
      role="status"
      aria-label="Preview mode"
      className="mb-4 overflow-hidden rounded-xl border-2 border-dashed border-violet-400/90 bg-gradient-to-r from-violet-100 via-fuchsia-50 to-violet-100 px-4 py-3 shadow-[0_1px_0_0_rgba(139,92,246,0.15)] dark:border-violet-500/60 dark:from-violet-950/70 dark:via-fuchsia-950/40 dark:to-violet-950/70 dark:shadow-violet-900/30"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white shadow-md shadow-violet-600/30 dark:bg-violet-400 dark:text-violet-950 dark:shadow-violet-400/20">
          <PreviewIcon />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-tight text-violet-950 dark:text-violet-100">
            You&apos;re in preview mode
          </p>
          <p className="mt-0.5 text-xs leading-snug text-violet-800/90 dark:text-violet-200/85">
            Sample deck only — changes stay in this browser
          </p>
        </div>
        <span className="hidden shrink-0 rounded-full bg-violet-600/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-violet-800 sm:inline dark:bg-violet-400/15 dark:text-violet-200">
          Demo
        </span>
      </div>
    </div>
  );
}
