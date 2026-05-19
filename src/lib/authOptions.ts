import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        identify: { type: "text" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identify || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const value = credentials.identify.trim().toLowerCase();
        const isEmail = value.includes("@");

        const user = await prisma.user.findFirst({
          where: isEmail ? { email: value } : { username: value },
        });

        const fakeHash =
          "$2a$10$7QJ8dYy6fUQvZpWj1rK1cO8QbW9k6QYp7VjY5uZ3r1FQx6XJf9K8e";
        const hash = user?.passwordHash || fakeHash;
        const isMatch = await bcrypt.compare(credentials.password, hash);

        if (!user || !isMatch) {
          return null;
        }

        return {
          id: user.id,
          name: user.username,
          email: user.email,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email;

        if (!email) return false;

        let dbUser = await prisma.user.findUnique({
          where: { email },
        });

        if (!dbUser) {
          const baseUsername = email.split("@")[0];

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

        user.id = dbUser.id;
        user.name = dbUser.username;
        return true;
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.name;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.username as string;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
