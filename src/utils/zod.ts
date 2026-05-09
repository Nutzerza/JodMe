// utils/zod.ts
import { ZodError } from "zod";

export function mapZodErrors(error: ZodError) {
  const fieldErrors: Record<string, string> = {};

  error.issues.forEach((err) => {
    const field = err.path[0] as string;
    fieldErrors[field] = err.message;
  });

  return fieldErrors;
}
