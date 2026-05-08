import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  const isAuthPage = pathname.startsWith('/auth');
  const isPrivatePage = pathname.startsWith('/u');

  // 🔐 ตรวจ token
  let isValidToken = false;

  if (token) {
    try {
      await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET!)
      );
      isValidToken = true;
    } catch {
      isValidToken = false;
    }
  }

  // ✅ 1. ถ้า login แล้ว → ห้ามเข้า /auth
  if (isAuthPage && isValidToken) {
    return NextResponse.redirect(new URL('/u/me', req.url));
  }

  // ✅ 2. ถ้าเป็น private page แต่ยังไม่ login
  if (isPrivatePage && !isValidToken) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/auth', '/u/:path*'],
};
