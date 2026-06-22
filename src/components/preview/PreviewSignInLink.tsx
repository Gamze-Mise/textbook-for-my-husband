import Link from "next/link";
import { btnSecondaryCompact } from "@/components/ui/buttonClasses";

export default function PreviewSignInLink() {
  return (
    <Link href="/login" className={btnSecondaryCompact}>
      Sign in
    </Link>
  );
}
