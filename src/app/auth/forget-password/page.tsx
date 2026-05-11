'use client';

import { useState } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) { setError('กรุณากรอกอีเมล'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError('รูปแบบอีเมลไม่ถูกต้อง'); return; }

    setLoading(true);
    setError('');

    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setDone(true);
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(160deg,#060d1a 0%,#0a1220 50%,#060d1a 100%)' }}
    >
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle,#6366f1 0%,transparent 70%)', filter: 'blur(40px)' }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle,#14b8a6 0%,transparent 70%)', filter: 'blur(40px)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="relative w-full max-w-md">
          {/* Card */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(160deg,#0d1526 0%,#0a1020 100%)',
              border: '1px solid rgba(99,102,241,0.18)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.05)',
            }}
          >
            {/* Top glow stripe */}
            <div
              className="h-0.5 w-full"
              style={{ background: 'linear-gradient(to right,transparent,#6366f1,#14b8a6,transparent)' }}
            />

            <div className="px-8 py-8">
              {done ? (
                /* ── Success state ── */
                <div className="text-center py-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                    style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)' }}
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h2 className="text-white font-bold text-xl mb-2">ตรวจสอบอีเมลของคุณ</h2>
                  <p className="text-slate-400 text-sm leading-relaxed mb-1">
                    หากอีเมล <span className="text-slate-200 font-medium">{email}</span>
                  </p>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปแล้ว
                  </p>
                  <p className="text-slate-500 text-xs mb-6">
                    ไม่เห็นอีเมล? ลองตรวจสอบในโฟลเดอร์สแปม
                  </p>
                  <button
                    onClick={() => { setDone(false); setEmail(''); }}
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                  >
                    ส่งอีเมลอีกครั้ง
                  </button>
                </div>
              ) : (
                /* ── Form state ── */
                <>
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}
                  >
                    <Mail className="w-5 h-5 text-indigo-400" />
                  </div>

                  <h1 className="text-white font-bold text-2xl mb-1">ลืมรหัสผ่าน?</h1>
                  <p className="text-slate-400 text-sm mb-7 leading-relaxed">
                    กรอกอีเมลที่ผูกกับบัญชีของคุณ เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านให้
                  </p>

                  <form onSubmit={submit} noValidate>
                    <div className="mb-4">
                      <label
                        htmlFor="email"
                        className="block text-xs font-semibold uppercase tracking-widest mb-2"
                        style={{ color: 'rgba(99,102,241,0.8)' }}
                      >
                        อีเมล
                      </label>
                      <div className="relative">
                        <Mail
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                          style={{ color: error ? '#f87171' : email ? '#6366f1' : '#475569' }}
                        />
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setError(''); }}
                          placeholder="your@email.com"
                          autoComplete="email"
                          autoFocus
                          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
                          style={{
                            background: 'rgba(15,23,42,0.8)',
                            border: `1px solid ${error ? 'rgba(248,113,113,0.5)' : email ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.15)'}`,
                            boxShadow: error
                              ? '0 0 0 3px rgba(248,113,113,0.08)'
                              : email
                                ? '0 0 0 3px rgba(99,102,241,0.08)'
                                : 'none',
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.border = `1px solid ${error ? 'rgba(248,113,113,0.6)' : 'rgba(99,102,241,0.5)'}`;
                            e.currentTarget.style.boxShadow = error
                              ? '0 0 0 3px rgba(248,113,113,0.1)'
                              : '0 0 0 3px rgba(99,102,241,0.1)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.border = `1px solid ${error ? 'rgba(248,113,113,0.5)' : email ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.15)'}`;
                            e.currentTarget.style.boxShadow = error
                              ? '0 0 0 3px rgba(248,113,113,0.08)'
                              : email
                                ? '0 0 0 3px rgba(99,102,241,0.08)'
                                : 'none';
                          }}
                        />
                      </div>
                      {error && (
                        <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                          <span>⚠</span> {error}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                      style={{
                        background: 'linear-gradient(135deg,#4f46e5,#6366f1 50%,#14b8a6)',
                        boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                      }}
                      onMouseEnter={(e) => !loading && ((e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(99,102,241,0.5)')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(99,102,241,0.35)')}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          กำลังส่ง...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          ส่งลิงก์รีเซ็ตรหัสผ่าน
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Footer */}
            <div
              className="px-8 py-4 flex items-center justify-center"
              style={{ borderTop: '1px solid rgba(99,102,241,0.08)' }}
            >
              <Link
                href="/auth"
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                กลับไปหน้าเข้าสู่ระบบ
              </Link>
            </div>
          </div>

          {/* Floating label below */}
          <p className="text-center text-slate-600 text-xs mt-5">
            ยังไม่มีบัญชี?{' '}
            <Link href="/auth" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
              สมัครสมาชิก
            </Link>
          </p>
        </div>
      </motion.div>
    </div >
  );
}
