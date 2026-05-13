import type { ReactNode } from "react";

type Props = {
  kicker: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  /** When false, no rule under the header (e.g. Study). Default true. */
  showBottomBorder?: boolean;
};

export default function AppPageHeader({
  kicker,
  title,
  description,
  actions,
  showBottomBorder = true,
}: Props) {
  return (
    <header
      className={[
        "flex flex-wrap items-center justify-between gap-3",
        showBottomBorder
          ? "border-b border-zinc-200/80 pb-6 dark:border-zinc-800/80"
          : "pb-0",
      ].join(" ")}
    >
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{kicker}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        {description ? (
          <p className="max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
