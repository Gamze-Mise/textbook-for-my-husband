import Link from "next/link";
import type { ReactNode } from "react";
import { btnSecondaryCompact } from "@/components/ui/buttonClasses";

type Props = {
  href: string;
  children: ReactNode;
};

export default function AppNavLink({ href, children }: Props) {
  return (
    <Link href={href} className={btnSecondaryCompact}>
      {children}
    </Link>
  );
}
