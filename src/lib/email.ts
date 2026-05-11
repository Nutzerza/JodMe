// lib/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResetEmail(email: string, link: string) {
  await resend.emails.send({
    from: "JodMe <onboarding@resend.dev>", // dev ใช้อันนี้ได้เลย
    to: email,
    subject: "รีเซ็ตรหัสผ่านของคุณ",
    html: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2>รีเซ็ตรหัสผ่าน</h2>
        <p>คุณได้ขอรีเซ็ตรหัสผ่าน</p>
        <p>
          <a href="${link}" 
             style="background:#4f46e5;color:white;padding:10px 16px;border-radius:8px;text-decoration:none;">
            รีเซ็ตรหัสผ่าน
          </a>
        </p>
        <p>ลิงก์นี้จะหมดอายุใน 15 นาที</p>
      </div>
    `,
  });
}
