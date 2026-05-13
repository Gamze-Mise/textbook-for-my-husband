import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import QuizClient from "@/app/app/quiz/ui/QuizClient";

export default async function QuizPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-black">
      <QuizClient />
    </div>
  );
}
