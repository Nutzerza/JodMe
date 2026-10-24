// Authentication options for NextAuth.js, including Google and Credentials providers

import type { NextAuthOptions } from "next-auth";
// Import Google and Credentials providers for NextAuth.js
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
// Import bcrypt for password hashing and randomUUID for generating unique IDs
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    // Google authentication provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Credentials authentication provider
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identify: { type: "text" },
        password: { type: "password" },
      },

      // Authorize user credentials and handle UID mapping
      async authorize(credentials) {
        if (!credentials?.identify || !credentials?.password) {
          return null;
        }

        const value = credentials.identify.trim().toLowerCase();
        const isEmail = value.includes("@");

        const user = await prisma.user.findFirst({
          where: isEmail ? { email: value } : { username: value },
          include: {
            mapUserUid: true,
          },
        });

        const fakeHash =
          "$2a$10$7QJ8dYy6fUQvZpWj1rK1cO8QbW9k6QYp7VjY5uZ3r1FQx6XJf9K8e";

        const hash = user?.passwordHash || fakeHash;

        const isMatch = await bcrypt.compare(credentials.password, hash);

        if (!user || !isMatch) {
          return null;
        }

        // Create UID mapping if it doesn't exist for the user
        const uidMap =
          user.mapUserUid ??
          (await prisma.mapUserUid.upsert({
            where: {
              id: user.id,
            },
            update: {},
            create: {
              id: user.id,
              uid: randomUUID(),
            },
          }));

        return {
          id: String(user.id),
          uid: uidMap.uid,
          name: user.username,
          email: user.email,
        };
      },
    }),
  ],

  callbacks: {
    // Handle sign in callback for both Google and Credentials providers
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }

      const email = user.email;

      if (!email) {
        return false;
      }

      let dbUser = await prisma.user.findUnique({
        where: { email },
        include: {
          mapUserUid: true,
        },
      });

      // Create a new user if it doesn't exist in the database
      if (!dbUser) {
        const baseUsername = email.split("@")[0];

        let username = baseUsername;
        let count = 1;

        while (
          await prisma.user.findUnique({
            where: { username },
          })
        ) {
          username = `${baseUsername}${count}`;
          count++;
        }

        dbUser = await prisma.user.create({
          data: {
            username,
            email,
            image: user.image,
            mapUserUid: {
              create: {
                uid: randomUUID(),
              },
            },
          },
          include: {
            mapUserUid: true,
          },
        });
      }

      // Handle existing users who don't have a UID mapping yet
      const uidMap =
        dbUser.mapUserUid ??
        (await prisma.mapUserUid.upsert({
          where: {
            id: dbUser.id,
          },
          update: {},
          create: {
            id: dbUser.id,
            uid: randomUUID(),
          },
        }));

      user.id = String(dbUser.id);
      user.uid = uidMap.uid;
      user.name = dbUser.username;
      user.email = dbUser.email;

      return true;
    },

    async jwt({ token, user }) {
      // Populate JWT token with user information after sign in
      if (user) {
        token.id = user.id;
        token.uid = user.uid;
        token.username = user.name;
        token.email = user.email;
      }

      return token;
    },

    async session({ session, token }) {
      // Populate session object with user information from JWT token
      if (session.user) {
        session.user.id = token.id as string;
        session.user.uid = token.uid as string;
        session.user.username = token.username as string;
        session.user.email = token.email as string;
      }

      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
