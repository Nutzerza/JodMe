'use client';

import { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InputField from '@/components/InputField';

type LoginFormErrors = {
    identify?: string; // email or username
    password?: string;
};

export default function LoginForm({ onSuccess }: { onSuccess: (username: string) => void }) {
    const [form, setForm] = useState({ identify: '', password: '' });

    const [errors, setErrors] = useState<LoginFormErrors>({});
    const [formError, setFormError] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);

    const isInvalid = !form.identify || !form.password;

    const validator = () => {
        const newErrors: LoginFormErrors = {};

        const value = form.identify.trim();

        if (!value) {
            newErrors.identify = 'กรุณากรอกอีเมลหรือชื่อผู้ใช้';
        } else {
            const isEmail = value.includes('@');

            if (isEmail) {
                const emailRegex = /^\S+@\S+\.\S+$/;
                if (!emailRegex.test(value)) {
                    newErrors.identify = 'อีเมลไม่ถูกต้อง';
                }
            } else {
                // username validation (กำหนดเอง)
                if (value.length < 3) {
                    newErrors.identify = 'ชื่อผู้ใช้ต้องอย่างน้อย 3 ตัว';
                }
            }
        }

        if (!form.password.trim()) {
            newErrors.password = 'กรุณากรอกรหัสผ่าน';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validator()) return;

        try {
            setLoading(true);

            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    identify: form.identify.trim(),
                    password: form.password,
                }),
            });

            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message);

            onSuccess(data.user?.username);

        } catch (err: any) {
            setFormError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof typeof form) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;

            setForm(f => ({ ...f, [field]: value }));

            // clear field error
            setErrors(prev => ({ ...prev, [field]: undefined }));

            // clear global error
            setFormError(null);
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