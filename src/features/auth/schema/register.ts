// Schema for user registration, including frontend and API validation

import { z } from "zod";

// Base schema for registration, used by both frontend and API
export const registerBaseSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters"),

  email: z.string().trim().email("Invalid email address"),

  password: z.string().min(8, "Password must be at least 8 characters"),

  confirm: z.string(),
});

// Schema for Frontend: Validate Password Confirmation
export const registerSchema = registerBaseSchema.refine(
  (data) => data.password === data.confirm,
  {
    message: "Passwords do not match",
    path: ["confirm"],
  },
);

// Schema for API: No need to include confirm field
export const registerApiSchema = registerBaseSchema.omit({
  confirm: true,
});
