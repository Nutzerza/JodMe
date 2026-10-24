// This component renders the registration form for new users.
// It includes form validation, error handling, and integration with NextAuth for credential-based sign-in.
// The form consists of fields for username, email, password, and password confirmation, and displays appropriate error messages for invalid input or failed registration attempts.

"use client";

import { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
// Shared components & hooks for form handling
import { Button } from "@/shared/components/ui/button";
import { InputField } from "@/shared/components/form/InputField";
import { useForm } from "@/shared/hooks/useForm";
import { mapZodErrors } from "@/shared/utils/zod";
// Auth-specific types and schema
import { RegisterFormValues } from "@/features/auth/types/type";
import { registerSchema } from "@/features/auth/schema/register";

export function RegisterForm({
  onSuccess,
}: {
  onSuccess: (type: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const { form, errors, setErrors, formError, setFormError, handleChange } =
    useForm<RegisterFormValues>({
      username: "",
      email: "",
      password: "",
      confirm: "",
    });

  const validator = () => {
    const result = registerSchema.safeParse(form);

    if (!result.success) {
      setErrors(mapZodErrors(result.error));
      return false;
    }

    return true;
  };

  const onSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
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
        setFormError(data.message || "Registration failed");
        return;
      }

      // redirect เอง
      onSuccess("registered");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <InputField
          icon={<User size={16} />}
          name="username"
          placeholder="Username"
          value={form.username}
          error={!!errors.username}
          onChange={handleChange("username")}
        />
        {errors.username && (
          <p className="text-red-400 text-sm">{errors.username}</p>
        )}
      </div>

      <div className="space-y-1">
        <InputField
          icon={<Mail size={16} />}
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          error={!!errors.email}
          onChange={handleChange("email")}
        />
        {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
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

      <div className="space-y-1">
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

      {formError && (
        <p className="text-red-400 text-sm text-center">{formError}</p>
      )}

      <Button
        type="submit"
        disabled={loading || !!formError}
        variant="auth"
        className="w-full"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            Registering...
          </span>
        ) : (
          "Register"
        )}
      </Button>
    </form>
  );
}
