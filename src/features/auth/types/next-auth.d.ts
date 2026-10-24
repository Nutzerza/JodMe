// Type definitions for NextAuth.js, extending the default User, Session, and JWT interfaces

import type { DefaultSession } from "next-auth";

// Import DefaultSession type from NextAuth.js to extend the session user interface
declare module "next-auth" {
  interface User {
    uid?: string;
  }

  interface Session {
    user: {
      id: string;
      uid: string;
      username: string;
    } & DefaultSession["user"];
  }
}

// Extend the JWT interface to include custom properties for user identification
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    uid?: string;
    username?: string | null;
  }
}

export {};
