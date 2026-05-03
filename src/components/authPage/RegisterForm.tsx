'use client';

import { useState } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InputField from '@/components/InputField';

type RegisterFormErrors = {
  user_name?: string;
  email?: string;
  password?: string;
  confirm?: string;
};

export default function RegisterForm({ onSuccess }: { onSuccess: (username: string) => void }) {
  const [form, setForm] = useState({
    user_name: '',
    email: '',
    password: '',
    confirm: '',
  });

  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const isInvalid =
    !form.user_name ||
    !form.email ||
    !form.password ||
    !form.confirm;

  const validator = () => {
    const newErrors: RegisterFormErrors = {};

    if (!form.user_name.trim()) {
      newErrors.user_name = 'กรุณากรอกชื่อผู้ใช้';
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(form.email)) {
      newErrors.email = 'อีเมลไม่ถูกต้อง';
    }

    if (form.password.length < 6) {
      newErrors.password = 'รหัสผ่านต้องอย่างน้อย 6 ตัว';
    }

    if (form.password !== form.confirm) {
      newErrors.confirm = 'รหัสไม่ตรง';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validator()) return;

    try {
      setLoading(true);

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          email: form.email.trim(),
          name: form.user_name.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      localStorage.setItem('token', data.token);
      onSuccess(data.username);

    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForm(f => ({ ...f, [field]: value }));

      // clear error ของ field นั้น
      setErrors(prev => ({ ...prev, [field]: undefined }));
    };

  return (
    <form onSubmit={submit} className="space-y-4">

      <div className='space-y-1'>
        <InputField
          icon={<User size={16} />}
          name="user_name"
          placeholder="ชื่อ"
          value={form.user_name}
          error={!!errors.user_name}
          onChange={handleChange('user_name')}
        />
        {errors.user_name && (
          <p className="text-red-400 text-sm">{errors.user_name}</p>
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
