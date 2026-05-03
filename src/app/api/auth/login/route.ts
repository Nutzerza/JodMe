import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
	try {
		const { identify, password } = await req.json();

		if (!identify || !password) {
			return NextResponse.json(
				{ message: 'Missing credentials' },
				{ status: 400 }
			);
		}

		const value = identify.trim().toLowerCase();
		const isEmail = value.includes('@');

		// หา user
		const user = await prisma.user.findFirst({
			where: isEmail
				? { email: value }
				: { name: value },
		});

		if (!user) {
			return NextResponse.json(
				{ message: 'Invalid credentials' },
				{ status: 401 }
			);
		}

		// compare password
		const isMatch = await bcrypt.compare(password, user.passwordHash);

		if (!isMatch) {
			return NextResponse.json(
				{ message: 'Invalid credentials' },
				{ status: 401 }
			);
		}

		// 🎟️ generate JWT
		const token = jwt.sign(
			{ userId: user.id },
			process.env.JWT_SECRET!,
			{ expiresIn: '7d' }
		);

		// ✅ สร้าง response แล้ว set cookie
		const res = NextResponse.json({
			message: 'Login success',
			user: {
				id: user.id,
				email: user.email,
				username: user.username,
			},
		},
			{ status: 200 },
		);

		res.cookies.set('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 24 * 7, // 7 วัน
		});

		return res;

	} catch (err) {
		return NextResponse.json(
			{ message: 'Server error' },
			{ status: 500 }
		);
	}
}