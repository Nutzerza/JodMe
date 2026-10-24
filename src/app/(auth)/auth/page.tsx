// Auth page for handling user authentication (login/signup)
import { AuthPage } from "@/features/auth/pages/AuthPage";

interface Props {
  searchParams: Promise<{
    callbackUrl?: string | string[];
  }>;
}

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  const callbackUrl = getSafeCallbackUrl(params.callbackUrl);

  return <AuthPage callbackUrl={callbackUrl} />;
}

function getSafeCallbackUrl(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;

  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/me";
  }

  return raw;
}
