import type { Metadata } from "next";
import LandingPage from "@/components/marketing/LandingPage";

export const metadata: Metadata = {
  title: "Flashcards — Personal vocabulary trainer",
  description:
    "Private vocabulary deck with library, audio, study mode, and smart quizzes.",
};

export default function Home() {
  return <LandingPage />;
}
