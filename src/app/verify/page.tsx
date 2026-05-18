import VerifyClient from "@/app/verify/VerifyClient";

type PageProps = {
  searchParams: Promise<{ email?: string; token?: string }>;
};

export default async function VerifyPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  return <VerifyClient email={sp.email ?? ""} token={sp.token ?? ""} />;
}
