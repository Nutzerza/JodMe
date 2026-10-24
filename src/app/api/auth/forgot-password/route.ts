// API route for handling forget password requests and sending reset emails
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
// Import the function for sending reset emails
import { sendResetEmail } from "@/features/auth/lib/email";
// Import the crypto library for generating secure tokens
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "OK" });
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

      const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password/${token}`;

      await sendResetEmail(emailNormalized, resetLink);
    }

    return NextResponse.json({ message: "If email exists, link sent" });
  } catch {
    return NextResponse.json({ message: "OK" });
  }
}
