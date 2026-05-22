import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import QuizClient from "@/app/app/quiz/ui/QuizClient";

type PageProps = {
  searchParams: Promise<{ images?: string }>;
};

export default async function QuizPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { images } = await searchParams;
  const showImages = images !== "0";

  return (
    <div className="flex min-h-0 h-dvh flex-col overflow-hidden bg-zinc-50 dark:bg-black">
      <QuizClient showImages={showImages} />
    </div>
  );
}
