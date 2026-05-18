import LoginClient from "@/app/login/LoginClient";
import { safeCallbackUrl } from "@/lib/safeCallbackUrl";

type PageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  return <LoginClient callbackUrl={safeCallbackUrl(sp.callbackUrl)} />;
}
