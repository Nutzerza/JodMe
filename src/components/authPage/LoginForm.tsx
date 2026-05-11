// This component renders the login form for user authentication.
// It includes form validation, error handling, and integration with NextAuth for credential-based sign-in.
// The form consists of fields for email/username and password, and displays appropriate error messages for invalid input or failed login attempts.

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from "next-auth/react";
import { Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InputField from '@/components/InputField';
import { useForm } from '@/hooks/useForm';
import { loginSchema } from '@/lib/validators/auth';
import { mapZodErrors } from '@/utils/zod';

type LoginFormValues = {
  identify: string; // email or username
  password: string;
};

export default function LoginForm({ onSuccess }: { onSuccess: () => void }) {

  const { form, setForm, errors, setErrors, formError, setFormError, handleChange } = useForm<LoginFormValues>({ identify: '', password: '' });

  const [loading, setLoading] = useState(false);

  const isInvalid = !form.identify || !form.password;

  const validator = () => {
    const result = loginSchema.safeParse(form);

    if (!result.success) {
      setErrors(mapZodErrors(result.error));
      return false;
    }

    return true;
  };

  // Handle form submission for login
  const submit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validator()) return;

    try {
      setLoading(true);

      const res = await signIn("credentials", {
        redirect: false,
        identify: form.identify.trim(),
        password: form.password,
      });

      if (res?.error) {
        setFormError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else {
        // login สำเร็จ
        onSuccess();
      }
    } catch (err: any) {
      setFormError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">

      <div className='space-y-1'>
        <InputField
          icon={<Mail size={16} />}
          name="identify"
          type="text"
          placeholder="อีเมลหรือชื่อผู้ใช้"
          value={form.identify}
          error={!!errors.identify}
          onChange={handleChange('identify')}
        />
        {errors.identify && (
          <p className="text-red-400 text-sm">{errors.identify}</p>
        )}
      </div>

      <div className='space-y-1'>
        <InputField
          icon={<Lock size={16} />}
          name="password"
          type="password"
          placeholder="รหัสผ่าน"
          value={form.password}
          error={!!errors.password}
          onChange={handleChange('password')}
        />
        {errors.password && (
          <p className="text-red-400 text-sm">{errors.password}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Link href="/auth/forget-password" className="text-sm text-sky-400 hover:underline">
          ลืมรหัสผ่าน?
        </Link>
      </div>

      {formError && <p className="text-red-400 text-sm">{formError}</p>}

      <Button
        type="submit"
        disabled={loading || isInvalid}
        variant="auth"
        className="w-full"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            กำลังเข้าสู่ระบบ...
          </span>
        ) : (
          'เข้าสู่ระบบ'
        )}
      </Button>

    </form>
  );
}
