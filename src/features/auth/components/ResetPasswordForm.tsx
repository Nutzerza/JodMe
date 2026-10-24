// Form component for resetting the password using the provided token
"use client";

import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
// Import common utilities and hooks for form handling and validation
import { resetPasswordSchema } from "@/features/auth/schema/resetPassword";
import { InputField } from "@/shared/components/form/InputField";
import { useForm } from "@/shared/hooks/useForm";
import { mapZodErrors } from "@/shared/utils/zod";
// Import the type for the form values
import type { ResetPasswordFormValues } from "@/features/auth/types/type";

export function ResetPasswordForm({
  token,
  onDone,
}: {
  token: string;
  done: boolean;
  onDone: () => void;
}) {
  const { form, errors, setErrors, formError, setFormError, handleChange } =
    useForm<ResetPasswordFormValues>({ password: "", confirm: "" });

  const [loading, setLoading] = useState(false);

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.message || "An error occurred");
        return;
      }

      onDone();
    } catch {
      setFormError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Reset Password</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <InputField
            icon={<Lock size={16} />}
            name="password"
            type="password"
            showPasswordToggle
            placeholder="New Password"
            value={form.password}
            error={!!errors.password}
            onChange={handleChange("password")}
          />
          {errors.password && (
            <p className="text-red-400 text-sm">{errors.password}</p>
          )}
        </div>

        <div>
          <InputField
            icon={<Lock size={16} />}
            name="confirm"
            type="password"
            showPasswordToggle
            placeholder="Confirm Password"
            value={form.confirm}
            error={!!errors.confirm}
            onChange={handleChange("confirm")}
          />
          {errors.confirm && (
            <p className="text-red-400 text-sm">{errors.confirm}</p>
          )}
        </div>

        {formError && <p className="text-red-400 text-sm">{formError}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded bg-indigo-600 font-bold flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Change Password"
          )}
        </button>
      </form>
    </>
  );
}
