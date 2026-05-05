// app/api/register/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'Missing fields' },
        { status: 400 }
      );
    }

    const emailNormalized = email.toLowerCase();

    // check duplicate
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailNormalized },
          { username },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: 'Email or username already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email: emailNormalized,
        passwordHash: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        message: 'Register success',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
      { status: 201 }
    );

  } catch (err) {
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}