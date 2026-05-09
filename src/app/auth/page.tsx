// This is the main authentication page component.
// It renders the AuthClient component and handles navigation based on authentication success or back button clicks.

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
    // router.back();
    router.push(`/`);
  };

  return <AuthClient onSuccess={onSuccess} onBack={onBack} />;
}
