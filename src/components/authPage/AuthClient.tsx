'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Waves } from 'lucide-react';
import LoginForm from '@/components/authPage/LoginForm';
import RegisterForm from '@/components/authPage/RegisterForm';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
  callbackUrl?: string;
}

export default function AuthClient({ callbackUrl = '/me' }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const handleOAuth = async (provider: string) => {
    setOauthLoading(provider);
    await signIn(provider, { callbackUrl });
  };

  const handleSuccess = () => {
    router.push(callbackUrl);
  };

  return (
    <div
      className="min-h-screen text-white overflow-hidden relative flex items-center justify-center px-6 py-12"
      style={{
        background: 'linear-gradient(160deg, #020617 0%, #0c1a2e 40%, #0d2137 65%, #020617 100%)',
      }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-[10%] -left-[5%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.10) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-[10%] -right-[5%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(28,31,30,0.08) 0%, transparent 70%)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Waves className="text-teal-400" />
            <span className="text-xl font-bold tracking-widest text-sky-50">JodMe</span>
          </div>

          <p className="text-slate-400 text-sm">
            Your personal anime universe
          </p>

          <button onClick={() => router.push('/')} className="text-sky-400 text-sm mt-4">
            Back to home
          </button>
        </div>

        <div
          className="rounded-2xl px-9 py-8 border border-sky-900/25 backdrop-blur-xl"
          style={{
            background: 'rgba(12,26,46,0.70)',
            boxShadow: '0 0 60px rgba(14,165,233,0.06), 0 24px 48px rgba(2,6,23,0.5)',
          }}
        >
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'signup')}>
            <TabsList className="w-full flex bg-[#020617]/60 rounded-xl p-1 mb-7 border border-sky-900/20">
              <TabsTrigger
                value="login"
                className="rounded-lg text-md font-medium text-slate-500 hover:text-slate-400 data-[state=active]:text-sky-50 data-[state=active]:shadow-[0_2px_12px_rgba(14,165,233,0.25)] data-[state=active]:bg-[linear-gradient(135deg,#0284c7,#0d9488)]"
              >
                Login
              </TabsTrigger>

              <TabsTrigger
                value="signup"
                className="rounded-lg text-md font-medium text-slate-500 hover:text-slate-400 data-[state=active]:text-sky-50 data-[state=active]:shadow-[0_2px_12px_rgba(14,165,233,0.25)] data-[state=active]:bg-[linear-gradient(135deg,#0284c7,#0d9488)]"
              >
                Sign up
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, x: tab === 'login' ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: tab === 'login' ? 10 : -10 }}
                transition={{ duration: 0.2 }}
              >
                {tab === 'login' ? (
                  <LoginForm onSuccess={handleSuccess} />
                ) : (
                  <RegisterForm onSuccess={handleSuccess} />
                )}
              </motion.div>
            </AnimatePresence>
          </Tabs>

          <div className="flex items-center gap-3 mt-6 mb-6">
            <div className="flex-1 h-px bg-sky-900/20" />
            <span className="text-slate-600 text-xs">or</span>
            <div className="flex-1 h-px bg-sky-900/20" />
          </div>

          <button
            onClick={() => handleOAuth('google')}
            disabled={!!oauthLoading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-sky-900/25 bg-[#020617]/50 text-slate-300 text-sm font-medium transition-all duration-200 hover:border-sky-700/40 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {oauthLoading === 'google' ? (
              <span className="w-4 h-4 border-2 border-sky-400/40 border-t-sky-400 rounded-full animate-spin" />
            ) : (
              <span className="font-bold text-sky-300">G</span>
            )}
            {oauthLoading === 'google' ? 'Connecting...' : 'Continue with Google'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
