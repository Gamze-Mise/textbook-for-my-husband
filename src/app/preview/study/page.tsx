import StudyClient from "@/app/app/study/ui/StudyClient";

export default function PreviewStudyPage() {
  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-black">
      <StudyClient mode="preview" />
    </div>
  );
}
