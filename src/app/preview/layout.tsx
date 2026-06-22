import { notFound } from "next/navigation";
import { isPreviewEnabled } from "@/lib/preview/userId";

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isPreviewEnabled()) notFound();
  return children;
}
