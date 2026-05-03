// This component is the main authentication page that includes both login and registration forms. 
// It uses tabs to switch between the two forms and includes some ambient glow effects for a more visually appealing design.
// The component also accepts an `onSuccess` callback that is called when either form is successfully submitted, and an optional `onBack` callback to allow users to navigate back to the previous page.

'use client';

import { useState } from 'react';
import { Waves } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/authPage/LoginForm';
import RegisterForm from '@/components/authPage/RegisterForm';

interface Props {
  onSuccess: (username: string) => void;
  onBack?: () => void;
}

export default function AuthClient({ onSuccess, onBack }: Props) {

  const [tab, setTab] = useState<'login' | 'signup'>('login');

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
          </div>
        </div>
      </motion.div >
    </div>
  );
}
