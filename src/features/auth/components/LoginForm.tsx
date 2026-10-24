// This component renders the login form for user authentication.
// It includes form validation, error handling, and integration with NextAuth for credential-based sign-in.
// The form consists of fields for email/username and password, and displays appropriate error messages for invalid input or failed login attempts.

"use client";

import Link from "next/link";
import { useState } from "react";
import { User, Lock } from "lucide-react";
import { signIn } from "next-auth/react";
// Shared components & hooks for form handling
import { Button } from "@/shared/components/ui/button";
import { InputField } from "@/shared/components/form/InputField";
import { useForm } from "@/shared/hooks/useForm";
import { mapZodErrors } from "@/shared/utils/zod";
// Auth-specific types and schema
import { loginSchema } from "@/features/auth/schema/login";
import type { LoginFormValues } from "@/features/auth/types/type";

export function LoginForm({
  onSuccess,
}: {
  onSuccess: (type: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const { form, errors, setErrors, formError, setFormError, handleChange } =
    useForm<LoginFormValues>({ identify: "", password: "" });

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
        setFormError("Email or password is incorrect");
      } else {
        // login สำเร็จ
        onSuccess("login");
      }
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "An error occurred during login",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1">
        <InputField
          icon={<User size={16} />}
          name="identify"
          type="text"
          placeholder="Email or Username"
          value={form.identify}
          error={!!errors.identify}
          onChange={handleChange("identify")}
        />
        {errors.identify && (
          <p className="text-red-400 text-sm">{errors.identify}</p>
        )}
      </div>

      <div className="space-y-1">
        <InputField
          icon={<Lock size={16} />}
          name="password"
          type="password"
          showPasswordToggle
          placeholder="Password"
          value={form.password}
          error={!!errors.password}
          onChange={handleChange("password")}
        />
        {errors.password && (
          <p className="text-red-400 text-sm">{errors.password}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Link
          href="/auth/forget-password"
          className="text-sm text-sky-400 hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      {formError && <p className="text-red-400 text-sm">{formError}</p>}

      <Button
        type="submit"
        disabled={loading || !!formError}
        variant="auth"
        className="w-full"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            Logging in...
          </span>
        ) : (
          "Log in"
        )}
      </Button>
    </form>
  );
}
