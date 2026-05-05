// This component is the main authentication page that includes both login and registration forms. 
// It uses tabs to switch between the two forms and includes some ambient glow effects for a more visually appealing design.
// The component also accepts an `onSuccess` callback that is called when either form is successfully submitted, and an optional `onBack` callback to allow users to navigate back to the previous page.

'use client';

import { useState } from 'react';
import { signIn } from "next-auth/react";
import { Waves } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/authPage/LoginForm';
import RegisterForm from '@/components/authPage/RegisterForm';

interface Props {
  onSuccess: () => void;
  onBack?: () => void;
}

export default function AuthClient({ onSuccess, onBack }: Props) {

  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const handleOAuth = async (provider: string) => {
    setOauthLoading(provider);
    await signIn(provider, {
      callbackUrl: "/u/me",
    });
  };

  return (
    <div className="min-h-screen text-white overflow-hidden relative flex items-center justify-center px-6 py-12"
      style={{
        background: 'linear-gradient(160deg, #020617 0%, #0c1a2e 40%, #0d2137 65%, #020617 100%)',
      }}>

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-[10%] -left-[5%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.10) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-[10%] -right-[5%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(28, 31, 30, 0.08) 0%, transparent 70%)' }}
        />
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]">
          <defs>
            <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="text-center mb-8">
            {onBack && (
              <button onClick={onBack} className="text-sky-400 text-sm mb-4">
                ← กลับหน้าแรก
              </button>
            )}

            <div className="flex items-center justify-center gap-2 mb-1">
              <Waves className="text-teal-400" />
              <span className="text-xl font-bold tracking-widest text-sky-50">JodMe</span>
            </div>

            <p className="text-slate-400 text-sm">
              Your personal anime universe
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl px-9 py-8 border border-sky-900/25 backdrop-blur-xl"
            style={{
              background: 'rgba(12,26,46,0.70)',
              boxShadow: '0 0 60px rgba(14,165,233,0.06), 0 24px 48px rgba(2,6,23,0.5)',
            }}>

            {/* Tabs for switching between login and registration forms, with animation effects for smooth transitions. */}
            <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'signup')}>
              <TabsList className="w-full flex bg-[#020617]/60 rounded-xl p-1 mb-7 border border-sky-900/20">
                <TabsTrigger
                  value="login"
                  className="
                    rounded-lg text-md font-medium
                    text-slate-500 hover:text-slate-400
                    data-[state=active]:text-sky-50
                    data-[state=active]:shadow-[0_2px_12px_rgba(14,165,233,0.25)]
                    data-[state=active]:bg-[linear-gradient(135deg,#0284c7,#0d9488)]
                  ">
                  เข้าสู่ระบบ
                </TabsTrigger>

                <TabsTrigger
                  value="signup"
                  className="
                    rounded-lg text-md font-medium
                    text-slate-500 hover:text-slate-400
                    data-[state=active]:text-sky-50
                    data-[state=active]:shadow-[0_2px_12px_rgba(14,165,233,0.25)]
                    data-[state=active]:bg-[linear-gradient(135deg,#0284c7,#0d9488)]
                  ">
                  สมัครสมาชิก
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
                    <LoginForm onSuccess={onSuccess} />
                  ) : (
                    <RegisterForm onSuccess={onSuccess} />
                  )}
                </motion.div>
              </AnimatePresence>
            </Tabs>

            {/* Divider */}
            <div className="flex items-center gap-3 mt-6 mb-6">
              <div className="flex-1 h-px bg-sky-900/20" />
              <span className="text-slate-600 text-xs">หรือใช้อีเมล</span>
              <div className="flex-1 h-px bg-sky-900/20" />
            </div>

            <div className="flex flex-col gap-3 mb-3">
              {[
                {
                  id: 'google',
                  label: 'ดำเนินการต่อด้วย Google',
                  icon: (
                    <svg width="17" height="17" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  ),
                },
              ].map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => handleOAuth(id)}
                  disabled={!!oauthLoading}
                  className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-sky-900/25 bg-[#020617]/50 text-slate-300 text-sm font-medium transition-all duration-200 hover:border-sky-700/40 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {oauthLoading === id ? (
                    <span className="w-4 h-4 border-2 border-sky-400/40 border-t-sky-400 rounded-full animate-spin" />
                  ) : (
                    icon
                  )}
                  {oauthLoading === id ? 'กำลังเชื่อมต่อ...' : label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div >
    </div>
  );
}
