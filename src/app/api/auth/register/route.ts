// app/api/auth/register/route.ts
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from "@/lib/validators/auth";

export async function POST(req: NextRequest) {
  try {

    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'Missing fields' },
        { status: 400 }
      );
    }

    const result = registerSchema.safeParse({
      username: username,
      email: email,
      password: password,
      confirm: password,
    });

    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid input" },
        { status: 400 }
      );
    }

    const emailNormalized = email.trim().toLowerCase();
    const usernameNormalized = username.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await prisma.user.create({
        data: {
          username: usernameNormalized,
          email: emailNormalized,
          passwordHash: hashedPassword,
        },
      });

      return NextResponse.json(
        {
          message: 'Register success',
        },
        { status: 201 }
      );
    } catch (err: any) {
      if (err.code === 'P2002') {
        return NextResponse.json(
          { message: 'ไม่สามารถสมัครได้' },
          { status: 400 }
        );
      }
      throw err;
    }
  } catch (err) {
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
