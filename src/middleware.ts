import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  //  กันหน้า public ก่อน (สำคัญ)
  if (pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  const token = req.cookies.get('token')?.value;

  // ไม่มี token → ไป login
  if (!token) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/auth', req.url));
  }
}

export const config = {
  matcher: ['/u/:path*'], // หน้า private
};
