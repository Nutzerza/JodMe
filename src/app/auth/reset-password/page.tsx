'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, Loader2 } from 'lucide-react';
import { resetPasswordSchema } from '@/lib/validators/auth';
import { mapZodErrors } from '@/utils/zod';

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();

  const token = params.get("token") || "";

  const [form, setForm] = useState({
    password: "",
    confirm: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange =
    (field: keyof typeof form) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((f) => ({ ...f, [field]: e.target.value }));
        setErrors((prev: any) => ({ ...prev, [field]: undefined }));
        setFormError("");
      };

  const validate = () => {
    const result = resetPasswordSchema.safeParse({
      ...form,
      token,
    });

    if (!result.success) {
      setErrors(mapZodErrors(result.error));
      return false;
    }

    return true;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.message || "เกิดข้อผิดพลาด");
        return;
      }

      setDone(true);

      // redirect หลัง 2 วิ
      setTimeout(() => {
        router.push("/auth");
      }, 2000);

    } catch {
      setFormError("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center text-red-400 mt-20">
        Invalid or missing token
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
      <div className="w-full max-w-md bg-slate-900 p-6 rounded-xl border border-slate-800">

        {done ? (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">สำเร็จ 🎉</h2>
            <p className="text-slate-400">กำลังพาไปหน้า login...</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-6">ตั้งรหัสผ่านใหม่</h1>

            <form onSubmit={submit} className="space-y-4">

              {/* password */}
              <div>
                <input
                  type="password"
                  placeholder="รหัสผ่านใหม่"
                  value={form.password}
                  onChange={handleChange("password")}
                  className="w-full p-3 rounded bg-slate-800 border border-slate-700"
                />
                {errors.password && (
                  <p className="text-red-400 text-sm">{errors.password}</p>
                )}
              </div>

              {/* confirm */}
              <div>
                <input
                  type="password"
                  placeholder="ยืนยันรหัสผ่าน"
                  value={form.confirm}
                  onChange={handleChange("confirm")}
                  className="w-full p-3 rounded bg-slate-800 border border-slate-700"
                />
                {errors.confirm && (
                  <p className="text-red-400 text-sm">{errors.confirm}</p>
                )}
              </div>

              {formError && (
                <p className="text-red-400 text-sm">{formError}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded bg-indigo-600 font-bold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  "เปลี่ยนรหัสผ่าน"
                )}
              </button>

            </form>
          </>
        )}
      </div>
    </div>
  );
}
// 'use client';

// import { useSearchParams, useRouter } from 'next/navigation';
// import { useState } from 'react';
// import { KeyRound, Eye, EyeOff, CheckCircle2, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
// import Link from 'next/link';

// function StrengthBar({ password }: { password: string }) {
//   const checks = [
//     password.length >= 8,
//     /[A-Z]/.test(password),
//     /[0-9]/.test(password),
//     /[^A-Za-z0-9]/.test(password),
//   ];
//   const score = checks.filter(Boolean).length;
//   const colors = ['#ef4444', '#f97316', '#fbbf24', '#34d399'];
//   const labels = ['อ่อนมาก', 'อ่อน', 'ปานกลาง', 'แข็งแกร่ง'];
//   const color = score > 0 ? colors[score - 1] : 'rgba(99,102,241,0.1)';

//   if (!password) return null;

//   return (
//     <div className="mt-2">
//       <div className="flex gap-1 mb-1.5">
//         {[0, 1, 2, 3].map((i) => (
//           <div
//             key={i}
//             className="h-1 flex-1 rounded-full transition-all duration-300"
//             style={{ background: i < score ? color : 'rgba(99,102,241,0.1)' }}
//           />
//         ))}
//       </div>
//       <p className="text-xs transition-colors duration-200" style={{ color }}>
//         {score > 0 ? labels[score - 1] : ''}
//       </p>
//     </div>
//   );
// }

// function RequirementItem({ met, text }: { met: boolean; text: string }) {
//   return (
//     <li className="flex items-center gap-2 text-xs transition-colors duration-200" style={{ color: met ? '#34d399' : '#475569' }}>
//       <div
//         className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-200"
//         style={{ background: met ? '#34d399' : '#334155', boxShadow: met ? '0 0 6px #34d39980' : 'none' }}
//       />
//       {text}
//     </li>
//   );
// }

// export default function ResetPassword() {
//   const params = useSearchParams();
//   const router = useRouter();
//   const token = params.get('token');

//   const [password, setPassword] = useState('');
//   const [confirm, setConfirm] = useState('');
//   const [showPass, setShowPass] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [done, setDone] = useState(false);
//   const [error, setError] = useState('');

//   const isValidLength = password.length >= 8;
//   const hasUppercase = /[A-Z]/.test(password);
//   const hasNumber = /[0-9]/.test(password);
//   const hasSpecial = /[^A-Za-z0-9]/.test(password);
//   const passwordsMatch = password === confirm && confirm.length > 0;
//   const isStrong = isValidLength && hasUppercase && hasNumber;

//   const submit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!isValidLength) { setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'); return; }
//     if (!passwordsMatch) { setError('รหัสผ่านไม่ตรงกัน'); return; }
//     if (!token) { setError('ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว'); return; }

//     setLoading(true);
//     setError('');

//     try {
//       const res = await fetch('/api/auth/reset-password', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ token, password }),
//       });

//       if (!res.ok) {
//         const data = await res.json().catch(() => ({}));
//         throw new Error(data?.message ?? 'เกิดข้อผิดพลาด');
//       }

//       setDone(true);
//     } catch (err: any) {
//       setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // No token guard
//   if (!token) {
//     return (
//       <div
//         className="min-h-screen flex items-center justify-center p-4"
//         style={{ background: 'linear-gradient(160deg,#060d1a 0%,#0a1220 50%,#060d1a 100%)' }}
//       >
//         <div
//           className="w-full max-w-md rounded-2xl text-center px-8 py-10"
//           style={{ background: 'linear-gradient(160deg,#0d1526 0%,#0a1020 100%)', border: '1px solid rgba(248,113,113,0.2)' }}
//         >
//           <div
//             className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
//             style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
//           >
//             <KeyRound className="w-6 h-6 text-rose-400" />
//           </div>
//           <h2 className="text-white font-bold text-lg mb-2">ลิงก์ไม่ถูกต้อง</h2>
//           <p className="text-slate-400 text-sm mb-6">ลิงก์สำหรับรีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว</p>
//           <Link
//             href="/forgot-password"
//             className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
//             style={{ background: 'linear-gradient(135deg,#4f46e5,#6366f1)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}
//           >
//             ขอลิงก์ใหม่
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div
//       className="min-h-screen flex items-center justify-center p-4"
//       style={{ background: 'linear-gradient(160deg,#060d1a 0%,#0a1220 50%,#060d1a 100%)' }}
//     >
//       {/* Orbs */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
//           style={{ background: 'radial-gradient(circle,#6366f1 0%,transparent 70%)', filter: 'blur(40px)' }} />
//         <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-15"
//           style={{ background: 'radial-gradient(circle,#14b8a6 0%,transparent 70%)', filter: 'blur(40px)' }} />
//       </div>

//       <div className="relative w-full max-w-md">
//         <div
//           className="rounded-2xl overflow-hidden"
//           style={{
//             background: 'linear-gradient(160deg,#0d1526 0%,#0a1020 100%)',
//             border: '1px solid rgba(99,102,241,0.18)',
//             boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
//           }}
//         >
//           <div className="h-0.5 w-full" style={{ background: 'linear-gradient(to right,transparent,#6366f1,#14b8a6,transparent)' }} />

//           <div className="px-8 py-8">
//             {done ? (
//               /* ── Success ── */
//               <div className="text-center py-4">
//                 <div
//                   className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
//                   style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)' }}
//                 >
//                   <CheckCircle2 className="w-8 h-8 text-emerald-400" />
//                 </div>
//                 <h2 className="text-white font-bold text-xl mb-2">เปลี่ยนรหัสผ่านแล้ว!</h2>
//                 <p className="text-slate-400 text-sm leading-relaxed mb-7">
//                   รหัสผ่านของคุณถูกอัปเดตเรียบร้อยแล้ว<br />สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้เลย
//                 </p>
//                 <button
//                   onClick={() => router.push('/login')}
//                   className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all"
//                   style={{ background: 'linear-gradient(135deg,#4f46e5,#6366f1 50%,#14b8a6)', boxShadow: '0 4px 20px rgba(99,102,241,0.35)' }}
//                 >
//                   เข้าสู่ระบบ
//                   <ArrowRight className="w-4 h-4" />
//                 </button>
//               </div>
//             ) : (
//               /* ── Form ── */
//               <>
//                 <div
//                   className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
//                   style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}
//                 >
//                   <ShieldCheck className="w-5 h-5 text-indigo-400" />
//                 </div>
//                 <h1 className="text-white font-bold text-2xl mb-1">ตั้งรหัสผ่านใหม่</h1>
//                 <p className="text-slate-400 text-sm mb-7 leading-relaxed">
//                   เลือกรหัสผ่านที่แข็งแกร่งและจำง่ายสำหรับคุณ
//                 </p>

//                 <form onSubmit={submit} noValidate className="space-y-4">
//                   {/* New password */}
//                   <div>
//                     <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(99,102,241,0.8)' }}>
//                       รหัสผ่านใหม่
//                     </label>
//                     <div className="relative">
//                       <KeyRound
//                         className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
//                         style={{ color: password ? '#6366f1' : '#475569' }}
//                       />
//                       <input
//                         type={showPass ? 'text' : 'password'}
//                         value={password}
//                         onChange={(e) => { setPassword(e.target.value); setError(''); }}
//                         placeholder="อย่างน้อย 8 ตัวอักษร"
//                         autoFocus
//                         className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
//                         style={{
//                           background: 'rgba(15,23,42,0.8)',
//                           border: `1px solid ${password ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.15)'}`,
//                           boxShadow: password ? '0 0 0 3px rgba(99,102,241,0.08)' : 'none',
//                         }}
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowPass((v) => !v)}
//                         className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
//                       >
//                         {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                       </button>
//                     </div>
//                     <StrengthBar password={password} />

//                     {/* Requirements */}
//                     {password && (
//                       <ul className="mt-3 space-y-1.5 pl-0.5">
//                         <RequirementItem met={isValidLength} text="อย่างน้อย 8 ตัวอักษร" />
//                         <RequirementItem met={hasUppercase} text="ตัวพิมพ์ใหญ่ (A–Z)" />
//                         <RequirementItem met={hasNumber} text="ตัวเลข (0–9)" />
//                         <RequirementItem met={hasSpecial} text="อักขระพิเศษ เช่น !@#$" />
//                       </ul>
//                     )}
//                   </div>

//                   {/* Confirm password */}
//                   <div>
//                     <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(99,102,241,0.8)' }}>
//                       ยืนยันรหัสผ่าน
//                     </label>
//                     <div className="relative">
//                       <KeyRound
//                         className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
//                         style={{ color: confirm ? (passwordsMatch ? '#34d399' : '#f87171') : '#475569' }}
//                       />
//                       <input
//                         type={showConfirm ? 'text' : 'password'}
//                         value={confirm}
//                         onChange={(e) => { setConfirm(e.target.value); setError(''); }}
//                         placeholder="กรอกรหัสผ่านอีกครั้ง"
//                         className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
//                         style={{
//                           background: 'rgba(15,23,42,0.8)',
//                           border: `1px solid ${confirm
//                             ? passwordsMatch
//                               ? 'rgba(52,211,153,0.4)'
//                               : 'rgba(248,113,113,0.4)'
//                             : 'rgba(99,102,241,0.15)'}`,
//                           boxShadow: confirm
//                             ? passwordsMatch
//                               ? '0 0 0 3px rgba(52,211,153,0.08)'
//                               : '0 0 0 3px rgba(248,113,113,0.08)'
//                             : 'none',
//                         }}
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowConfirm((v) => !v)}
//                         className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
//                       >
//                         {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                       </button>
//                     </div>
//                     {confirm && !passwordsMatch && (
//                       <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
//                         <span>⚠</span> รหัสผ่านไม่ตรงกัน
//                       </p>
//                     )}
//                     {confirm && passwordsMatch && (
//                       <p className="mt-1.5 text-xs text-emerald-400 flex items-center gap-1">
//                         <CheckCircle2 className="w-3 h-3" /> รหัสผ่านตรงกัน
//                       </p>
//                     )}
//                   </div>

//                   {/* Global error */}
//                   {error && (
//                     <div
//                       className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs text-rose-300"
//                       style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
//                     >
//                       <span>⚠</span> {error}
//                     </div>
//                   )}

//                   <button
//                     type="submit"
//                     disabled={loading || !isValidLength || !passwordsMatch}
//                     className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
//                     style={{
//                       background: 'linear-gradient(135deg,#4f46e5,#6366f1 50%,#14b8a6)',
//                       boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
//                     }}
//                   >
//                     {loading ? (
//                       <><Loader2 className="w-4 h-4 animate-spin" />กำลังบันทึก...</>
//                     ) : (
//                       <><ShieldCheck className="w-4 h-4" />ยืนยันรหัสผ่านใหม่</>
//                     )}
//                   </button>
//                 </form>
//               </>
//             )}
//           </div>

//           <div className="px-8 py-4 flex items-center justify-center" style={{ borderTop: '1px solid rgba(99,102,241,0.08)' }}>
//             <Link href="/login" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
//               ← กลับไปหน้าเข้าสู่ระบบ
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }