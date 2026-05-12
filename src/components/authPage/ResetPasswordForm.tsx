'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { resetPasswordSchema } from '@/lib/validators/auth';
import { mapZodErrors } from '@/utils/zod';

export default function ResetPasswordForm() {
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
        headers: { "Content-Type": "application/json" }, // 🔥 เพิ่ม
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