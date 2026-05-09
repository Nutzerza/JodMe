// hooks/useForm.ts
import { useState } from "react";

export function useForm<T extends Record<string, any>>(initial: T) {
  const [form, setForm] = useState<T>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange =
    (field: keyof T) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        setForm((f) => ({ ...f, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
        setFormError(null);
      };

  return {
    form,
    setForm,
    errors,
    setErrors,
    formError,
    setFormError,
    handleChange,
  };
}
