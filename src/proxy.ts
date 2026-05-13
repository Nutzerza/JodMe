import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthPage = pathname.startsWith('/auth');
  const isPrivatePage = pathname.startsWith('/u');

  // ✅ 1. login แล้ว ห้ามเข้า auth
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/me', req.url));
  }

  // ✅ 2. ยังไม่ login แต่เข้า private
  if (isPrivatePage && !token) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  return NextResponse.next();
}