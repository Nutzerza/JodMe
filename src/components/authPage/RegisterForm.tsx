// This component renders the registration form for new users.
// It includes form validation, error handling, and integration with NextAuth for credential-based sign-in.
// The form consists of fields for username, email, password, and password confirmation, and displays appropriate error messages for invalid input or failed registration attempts.

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InputField from '@/components/InputField';
import { useForm } from '@/hooks/useForm';
import { registerSchema } from "@/lib/validators/auth";
import { mapZodErrors } from '@/utils/zod';

type RegisterFormValues = {
  username: string;
  email: string;
  password: string;
  confirm: string;
};

export default function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const { form, setForm, errors, setErrors, formError, setFormError, handleChange } = useForm<RegisterFormValues>({
    username: '',
    email: '',
    password: '',
    confirm: '',
  });

  const [loading, setLoading] = useState(false);

  const isInvalid =
    !form.username ||
    !form.email ||
    !form.password ||
    !form.confirm;

  const validator = () => {
    const result = registerSchema.safeParse(form);

    if (!result.success) {
      setErrors(mapZodErrors(result.error));
      return false;
    }

    return true;
  };

  const submit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validator()) return;

    try {
      setLoading(true);

      // register ก่อน
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.message || "สมัครไม่สำเร็จ");
        return;
      }

      // auto login หลังสมัคร
      const loginRes = await signIn("credentials", {
        redirect: false,
        identify: form.email,
        password: form.password,
      });

      if (loginRes?.error) {
        setFormError("สมัครสำเร็จ แต่เข้าสู่ระบบไม่สำเร็จ");
        return;
      }
      // redirect เอง
      onSuccess();

    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">

      <div className='space-y-1'>
        <InputField
          icon={<User size={16} />}
          name="username"
          placeholder="ชื่อ"
          value={form.username}
          error={!!errors.username}
          onChange={handleChange('username')}
        />
        {errors.username && (
          <p className="text-red-400 text-sm">{errors.username}</p>
        )}
      </div>

      <div className='space-y-1'>
        <InputField
          icon={<Mail size={16} />}
          name="email"
          type="email"
          placeholder="อีเมล"
          value={form.email}
          error={!!errors.email}
          onChange={handleChange('email')}
        />
        {errors.email && (
          <p className="text-red-400 text-sm">{errors.email}</p>
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

      <div className='space-y-1'>
        <InputField
          icon={<Lock size={16} />}
          name="confirm"
          type="password"
          placeholder="ยืนยันรหัสผ่าน"
          value={form.confirm}
          error={!!errors.confirm}
          onChange={handleChange('confirm')}
        />
        {errors.confirm && (
          <p className="text-red-400 text-sm">{errors.confirm}</p>
        )}
      </div>

      {formError && <p className="text-red-400 text-sm text-center">{formError}</p>}

      <Button type="submit" disabled={loading || isInvalid} variant="auth" className="w-full">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            กำลังสมัคร...
          </span>
        ) : (
          'สมัครสมาชิก'
        )}
      </Button>

    </form>
  );
}
