import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import StudyClient from "@/app/app/study/ui/StudyClient";

export default async function StudyPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-black">
      <StudyClient />
    </div>
  );
}

