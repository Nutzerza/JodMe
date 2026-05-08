// lib/auth.ts
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function getUserFromCookie(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) return null;

  return {
    userId: token.id as string,
    name: token.name,
    email: token.email,
  };
}
