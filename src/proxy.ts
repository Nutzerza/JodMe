import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthPage = pathname.startsWith('/auth');
  const isPrivatePage = pathname.startsWith('/me');

  // ✅ 1. login แล้ว ห้ามเข้า auth
  if (isAuthPage && token) {
    const callbackUrl = req.nextUrl.searchParams.get('callbackUrl');
    const destination =
      callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')
        ? callbackUrl
        : '/me';

    return NextResponse.redirect(new URL(destination, req.url));
  }

  // ✅ 2. ยังไม่ login แต่เข้า private
  if (isPrivatePage && !token) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/me/:path*', '/auth/:path*'],
};
