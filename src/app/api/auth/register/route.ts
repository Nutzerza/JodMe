// app/api/auth/register/route.ts

import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { registerApiSchema } from "@/features/auth/schema/register";

export async function POST(req: NextRequest) {
  // 1. Parse JSON
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  // 2. Validate input
  const result = registerApiSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const { username, email, password } = result.data;

    // 3. Normalize input
    const emailNormalized = email.trim().toLowerCase();
    const usernameNormalized = username.trim().toLowerCase();

    // 4. Check duplicate user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailNormalized }, { username: usernameNormalized }],
      },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email or username already exists" },
        { status: 409 },
      );
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Create User + MapUserUid
    await prisma.user.create({
      data: {
        username: usernameNormalized,
        email: emailNormalized,
        passwordHash: hashedPassword,
        mapUserUid: {
          create: {
            uid: randomUUID(),
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Registration successful" },
      { status: 201 },
    );
  } catch (err: unknown) {
    // 7. Handle unique constraint conflicts
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "Email or username already exists" },
        { status: 409 },
      );
    }

    // 8. Log internal errors only on the server
    console.error("Registration error:", err);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
