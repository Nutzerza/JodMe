'use client';

import { useState } from 'react';
import { Sparkles, Mail, Lock, User, Eye, EyeOff, ArrowRight, Waves } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthProps {
    onSuccess: () => void;
    onBack?: () => void;
}

export default function AuthClient({ onSuccess, onBack }: AuthProps) {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState<string | null>(null);

    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise((r) => setTimeout(r, 1200));
        setLoading(false);
        onSuccess();
    };

    const handleOAuth = async (provider: string) => {
        setOauthLoading(provider);
        await new Promise((r) => setTimeout(r, 1000));
        setOauthLoading(null);
        onSuccess();
    };

    const switchMode = (m: 'login' | 'signup') => {
        setMode(m);
        setForm({ name: '', email: '', password: '', confirm: '' });
        setShowPassword(false);
        setShowConfirm(false);
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(160deg, #020617 0%, #0c1a2e 40%, #0d2137 65%, #020617 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'DM Sans', system-ui, sans-serif",
                position: 'relative',
                overflow: 'hidden',
                padding: '24px',
            }}
        >
            {/* Ambient blobs */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <div style={{
                    position: 'absolute', top: '-10%', left: '-5%',
                    width: 500, height: 500, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(14,165,233,0.10) 0%, transparent 70%)',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-10%', right: '-5%',
                    width: 600, height: 600, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)',
                }} />
                <div style={{
                    position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)',
                    width: 800, height: 400, borderRadius: '50%',
                    background: 'radial-gradient(ellipse, rgba(56,189,248,0.04) 0%, transparent 70%)',
                }} />
                {/* Grid lines */}
                <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.04 }}>
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
                style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
            >
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    {onBack && (
                        <button
                            onClick={onBack}
                            style={{
                                background: 'none', border: 'none', color: '#38bdf8',
                                fontSize: 13, cursor: 'pointer', marginBottom: 20,
                                display: 'flex', alignItems: 'center', gap: 4, margin: '0 auto 20px',
                            }}
                        >
                            ← กลับหน้าแรก
                        </button>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
                        <Waves size={24} color="#2dd4bf" />
                        <span style={{ fontSize: 22, fontWeight: 700, color: '#f0f9ff', letterSpacing: '0.12em' }}>ANITRACK</span>
                    </div>
                    <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>Your personal anime universe</p>
                </div>

                {/* Card */}
                <div style={{
                    background: 'rgba(12, 26, 46, 0.7)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(56,189,248,0.12)',
                    borderRadius: 20,
                    padding: '32px 36px',
                    boxShadow: '0 0 60px rgba(14,165,233,0.06), 0 24px 48px rgba(2,6,23,0.5)',
                }}>

                    {/* Mode tabs */}
                    <div style={{
                        display: 'flex',
                        background: 'rgba(2,6,23,0.5)',
                        borderRadius: 10,
                        padding: 4,
                        marginBottom: 28,
                        border: '1px solid rgba(56,189,248,0.08)',
                    }}>
                        {(['login', 'signup'] as const).map((m) => (
                            <button
                                key={m}
                                onClick={() => switchMode(m)}
                                style={{
                                    flex: 1, padding: '9px 0', border: 'none', borderRadius: 8,
                                    fontSize: 14, fontWeight: 500, cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    background: mode === m
                                        ? 'linear-gradient(135deg, #0284c7, #0d9488)'
                                        : 'transparent',
                                    color: mode === m ? '#f0f9ff' : '#475569',
                                    boxShadow: mode === m ? '0 2px 12px rgba(14,165,233,0.25)' : 'none',
                                }}
                            >
                                {m === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
                            </button>
                        ))}
                    </div>

                    {/* OAuth */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                        {[
                            {
                                id: 'google',
                                label: 'ดำเนินการต่อด้วย Google',
                                icon: (
                                    <svg width="18" height="18" viewBox="0 0 24 24">
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
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                    padding: '11px 16px', borderRadius: 10, cursor: 'pointer',
                                    background: 'rgba(2,6,23,0.6)',
                                    border: '1px solid rgba(56,189,248,0.12)',
                                    color: '#cbd5e1', fontSize: 14, fontWeight: 500,
                                    transition: 'all 0.2s',
                                    opacity: oauthLoading && oauthLoading !== id ? 0.5 : 1,
                                }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(56,189,248,0.3)')}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(56,189,248,0.12)')}
                            >
                                {oauthLoading === id ? (
                                    <span style={{
                                        width: 16, height: 16, border: '2px solid #38bdf8',
                                        borderTopColor: 'transparent', borderRadius: '50%',
                                        display: 'inline-block', animation: 'spin 0.7s linear infinite',
                                    }} />
                                ) : icon}
                                {oauthLoading === id ? 'กำลังเชื่อมต่อ...' : label}
                            </button>
                        ))}
                    </div>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(56,189,248,0.1)' }} />
                        <span style={{ color: '#334155', fontSize: 12 }}>หรือใช้อีเมล</span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(56,189,248,0.1)' }} />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={mode}
                                initial={{ opacity: 0, x: mode === 'signup' ? 10 : -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: mode === 'signup' ? -10 : 10 }}
                                transition={{ duration: 0.2 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
                            >
                                {mode === 'signup' && (
                                    <InputField
                                        icon={<User size={15} color="#475569" />}
                                        placeholder="ชื่อผู้ใช้"
                                        value={form.name}
                                        onChange={v => setForm(f => ({ ...f, name: v }))}
                                        type="text"
                                    />
                                )}
                                <InputField
                                    icon={<Mail size={15} color="#475569" />}
                                    placeholder="อีเมล"
                                    value={form.email}
                                    onChange={v => setForm(f => ({ ...f, email: v }))}
                                    type="email"
                                />
                                <InputField
                                    icon={<Lock size={15} color="#475569" />}
                                    placeholder="รหัสผ่าน"
                                    value={form.password}
                                    onChange={v => setForm(f => ({ ...f, password: v }))}
                                    type={showPassword ? 'text' : 'password'}
                                    rightEl={
                                        <button type="button" onClick={() => setShowPassword(s => !s)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                                            {showPassword ? <EyeOff size={15} color="#475569" /> : <Eye size={15} color="#475569" />}
                                        </button>
                                    }
                                />
                                {mode === 'signup' && (
                                    <InputField
                                        icon={<Lock size={15} color="#475569" />}
                                        placeholder="ยืนยันรหัสผ่าน"
                                        value={form.confirm}
                                        onChange={v => setForm(f => ({ ...f, confirm: v }))}
                                        type={showConfirm ? 'text' : 'password'}
                                        rightEl={
                                            <button type="button" onClick={() => setShowConfirm(s => !s)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                                                {showConfirm ? <EyeOff size={15} color="#475569" /> : <Eye size={15} color="#475569" />}
                                            </button>
                                        }
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {mode === 'login' && (
                            <div style={{ textAlign: 'right', marginTop: 8, marginBottom: 4 }}>
                                <button type="button" style={{
                                    background: 'none', border: 'none', color: '#38bdf8',
                                    fontSize: 12, cursor: 'pointer',
                                }}>
                                    ลืมรหัสผ่าน?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', marginTop: 20, padding: '13px 0',
                                borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                                background: loading
                                    ? 'rgba(14,165,233,0.3)'
                                    : 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                                color: '#f0f9ff', fontSize: 15, fontWeight: 600,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                boxShadow: loading ? 'none' : '0 4px 20px rgba(14,165,233,0.3)',
                                transition: 'all 0.2s',
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={{
                                        width: 16, height: 16, border: '2px solid rgba(240,249,255,0.4)',
                                        borderTopColor: '#f0f9ff', borderRadius: '50%',
                                        display: 'inline-block', animation: 'spin 0.7s linear infinite',
                                    }} />
                                    กำลังดำเนินการ...
                                </>
                            ) : (
                                <>
                                    {mode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชี'}
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Switch mode */}
                    <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#475569' }}>
                        {mode === 'login' ? 'ยังไม่มีบัญชี? ' : 'มีบัญชีแล้ว? '}
                        <button
                            onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                            style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
                        >
                            {mode === 'login' ? 'สมัครสมาชิกฟรี' : 'เข้าสู่ระบบ'}
                        </button>
                    </p>
                </div>

                {/* Bottom note */}
                <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: '#1e293b' }}>
                    การสมัครแสดงว่าคุณยอมรับ Terms of Service และ Privacy Policy
                </p>
            </motion.div>

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #334155; }
        input { outline: none; }
      `}</style>
        </div>
    );
}

function InputField({
    icon, placeholder, value, onChange, type, rightEl,
}: {
    icon: React.ReactNode;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
    type: string;
    rightEl?: React.ReactNode;
}) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '0 14px', borderRadius: 10,
            background: 'rgba(2,6,23,0.5)',
            border: `1px solid ${focused ? 'rgba(56,189,248,0.35)' : 'rgba(56,189,248,0.1)'}`,
            transition: 'border 0.2s',
            boxShadow: focused ? '0 0 0 3px rgba(14,165,233,0.08)' : 'none',
        }}>
            {icon}
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                required
                style={{
                    flex: 1, background: 'none', border: 'none', padding: '12px 0',
                    color: '#e2e8f0', fontSize: 14,
                }}
            />
            {rightEl}
        </div>
    );
}