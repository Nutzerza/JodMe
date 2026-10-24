// API route for handling password reset requests using the provided token
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
// Import necessary modules for cryptographic operations and password hashing
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ message: "Invalid" }, { status: 400 });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Token is invalid or expired" },
        { status: 400 },
      );
    }

    const newPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: "Success" });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
