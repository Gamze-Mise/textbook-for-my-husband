import type { ReactNode } from "react";

const variants = {
  error:
    "border-red-200 bg-red-50 text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100",
  warning:
    "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100",
} as const;

type Variant = keyof typeof variants;

type Props = {
  variant: Variant;
  children: ReactNode;
  className?: string;
};

export default function AlertBanner({ variant, children, className = "" }: Props) {
  return (
    <div
      role="alert"
      className={[
        "rounded-2xl border p-4 text-sm leading-relaxed",
        variants[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
