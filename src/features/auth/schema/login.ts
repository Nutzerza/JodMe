// Schema for user login validation
import { z } from "zod";

export const loginSchema = z.object({
  identify: z
    .string()
    .min(1, "Please enter your email or username")
    .refine(
      (value) => {
        if (value.includes("@")) {
          return /^\S+@\S+\.\S+$/.test(value);
        }
        return value.length >= 3;
      },
      {
        message: "Invalid email or username must be at least 3 characters",
      },
    ),

  password: z.string().min(1, "Please enter your password"),
});
