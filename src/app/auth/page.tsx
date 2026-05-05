'use client';

import { useRouter } from 'next/navigation';
import AuthClient from '@/components/authPage/AuthClient';

export default function AuthPage() {

  const router = useRouter();

  const onSuccess = () => {
    // Handle successful authentication, e.g., redirect to dashboard
    router.push(`/u/me`);
  };

  const onBack = () => {
    // Handle back button click, e.g., navigate to previous page
    router.back();
  };

  return <AuthClient onSuccess={onSuccess} onBack={onBack} />;
}
