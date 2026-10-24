"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/shared/components/ui/input";

type InputFieldProps = {
  icon: React.ReactNode;
  error?: boolean;
  showPasswordToggle?: boolean;
} & React.ComponentProps<typeof Input>;

export function InputField({
  icon,
  error,
  showPasswordToggle = false,
  type,
  ...props
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    showPasswordToggle && type === "password"
      ? showPassword
        ? "text"
        : "password"
      : type;

  return (
    <div
      className={`flex items-center gap-2 px-3 rounded-lg border
        ${
          error
            ? "border-red-400 focus-within:border-red-400"
            : "border-slate-700 focus-within:border-sky-400"
        }`}
    >
      {icon}

      <Input
        {...props}
        type={inputType}
        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:border-0 px-0"
      />

      {showPasswordToggle && type === "password" && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
          className="shrink-0 text-slate-400 hover:text-slate-200"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
}
