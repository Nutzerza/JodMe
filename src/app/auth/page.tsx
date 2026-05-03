'use client';

import { useRouter } from 'next/navigation';
import AuthClient from '@/components/authPage/AuthClient';

export default function AuthPage() {

    const router = useRouter();

    const onSuccess = (username: string) => {
        // Handle successful authentication, e.g., redirect to dashboard
        console.log('Authenticated as:', `/u/${username}`);
        router.push(`/u/${username}`);
    };

    const onBack = () => {
        // Handle back button click, e.g., navigate to previous page
        router.back();
    };

    return <AuthClient onSuccess={onSuccess} onBack={onBack} />;
}
