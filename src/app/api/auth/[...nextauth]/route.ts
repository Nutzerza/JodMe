// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    // 🔑 Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Email / Username + Password
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identify: { },
        password: { },
      },
      async authorize(credentials) {
        if (!credentials?.identify || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const value = credentials.identify.trim().toLowerCase();
        const isEmail = value.includes("@");

        const user = await prisma.user.findFirst({
          where: isEmail
            ? { email: value }
            : { username: value },
        });

        if (!user) {
          throw new Error("User not found");
        }

        if (!user.passwordHash) {
          throw new Error("No password set");
        }

        const isMatch = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isMatch) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          name: user.username,
          email: user.email,
        };
      }
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // 🔥 เฉพาะ OAuth
      if (account?.provider === "google") {
        const email = user.email;

        if (!email) return false;

        // 🔎 หา user
        let dbUser = await prisma.user.findUnique({
          where: { email },
        });

        // ❗ ถ้าไม่มี → สร้างใหม่
        if (!dbUser) {
          const baseUsername = email.split("@")[0];

          // กัน username ซ้ำ
          let username = baseUsername;
          let count = 1;

          while (true) {
            const exists = await prisma.user.findUnique({
              where: { username },
            });

            if (!exists) break;

            username = `${baseUsername}${count}`;
            count++;
          }

          dbUser = await prisma.user.create({
            data: {
              username,
              email,
              image: user.image,
            },
          });
        }

        return true;
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },

  session: {
    strategy: "jwt", // ใช้ JWT ของ NextAuth แทนของเดิม
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };