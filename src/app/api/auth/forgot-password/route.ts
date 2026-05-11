// app/api/auth/forgot-password/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "OK" }); //ไม่บอก error
    }

    const emailNormalized = email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");

      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: hashedToken,
          resetTokenExpiry: new Date(Date.now() + 15 * 60 * 1000), // 15 นาที
        },
      });

      const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

      console.log("RESET LINK:", resetLink); // ตอนนี้ใช้ log ไปก่อน
      await sendResetEmail(emailNormalized, resetLink);
    }

    return NextResponse.json({ message: "If email exists, link sent" });

  } catch {
    return NextResponse.json({ message: "OK" });
  }
}
