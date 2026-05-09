// lib/validators/auth.ts
import { z } from "zod";

export const loginSchema = z.object({
  identify: z
    .string()
    .min(1, "กรุณากรอกอีเมลหรือชื่อผู้ใช้")
    .refine((value) => {
      if (value.includes("@")) {
        return /^\S+@\S+\.\S+$/.test(value);
      }
      return value.length >= 3;
    }, {
      message: "อีเมลไม่ถูกต้อง หรือชื่อผู้ใช้ต้องอย่างน้อย 3 ตัว",
    }),

  password: z
    .string()
    .min(1, "กรุณากรอกรหัสผ่าน"),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, "กรุณากรอกชื่อผู้ใช้")
      .min(3, "ชื่อผู้ใช้ต้องอย่างน้อย 3 ตัว"),

    email: z
      .string()
      .min(1, "กรุณากรอกอีเมล")
      .refine((value) => {
        if (value.includes("@")) {
          return /^\S+@\S+\.\S+$/.test(value);
        }
        return value.length >= 3;
      }, {
        message: "อีเมลไม่ถูกต้อง หรือชื่อผู้ใช้ต้องอย่างน้อย 3 ตัว",
      }),

    password: z
      .string()
      .min(6, "รหัสผ่านต้องอย่างน้อย 6 ตัว"),

    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "รหัสไม่ตรง",
    path: ["confirm"], // ชี้ error ไป field confirm
  });
