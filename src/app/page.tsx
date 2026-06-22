import type { Metadata } from "next";
import LandingPage from "@/components/marketing/LandingPage";
import { isPreviewEnabled } from "@/lib/preview/userId";

export const metadata: Metadata = {
  title: "Vocabulary — Personal vocabulary trainer",
  description:
    "Private vocabulary deck with library, audio, study mode, and smart quizzes.",
};

export default function Home() {
  return <LandingPage previewEnabled={isPreviewEnabled()} />;
}
