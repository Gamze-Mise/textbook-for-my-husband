import ResetPasswordClient from "@/app/reset-password/ResetPasswordClient";

type PageProps = {
  searchParams: Promise<{ email?: string; token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  return (
    <ResetPasswordClient email={sp.email ?? ""} token={sp.token ?? ""} />
  );
}
