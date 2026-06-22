import DashboardClient from "@/app/app/ui/DashboardClient";

export default function PreviewLibraryPage() {
  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-black">
      <DashboardClient mode="preview" />
    </div>
  );
}
