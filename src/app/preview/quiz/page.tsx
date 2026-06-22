import QuizClient from "@/app/app/quiz/ui/QuizClient";

type PageProps = {
  searchParams: Promise<{ images?: string }>;
};

export default async function PreviewQuizPage({ searchParams }: PageProps) {
  const { images } = await searchParams;
  const showImages = images !== "0";

  return (
    <div className="flex min-h-0 h-dvh flex-col overflow-hidden bg-zinc-50 dark:bg-black">
      <QuizClient mode="preview" showImages={showImages} />
    </div>
  );
}
