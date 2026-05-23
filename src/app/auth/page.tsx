import AuthClient from '@/components/authPage/AuthClient';

interface Props {
  searchParams: Promise<{
    callbackUrl?: string | string[];
  }>;
}

export default async function AuthPage({ searchParams }: Props) {
  const params = await searchParams;
  const callbackUrl = getSafeCallbackUrl(params.callbackUrl);

  return <AuthClient callbackUrl={callbackUrl} />;
}

function getSafeCallbackUrl(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;

  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) {
    return '/me';
  }

  return raw;
}
