import LoginClient from "@/app/login/LoginClient";
import { safeCallbackUrl } from "@/lib/safeCallbackUrl";
import { isPreviewEnabled } from "@/lib/preview/userId";

type PageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  return (
    <LoginClient
      callbackUrl={safeCallbackUrl(sp.callbackUrl)}
      previewEnabled={isPreviewEnabled()}
    />
  );
}
