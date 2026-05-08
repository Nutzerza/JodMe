// components/UserMenu.tsx
'use client';

import { signOut } from "next-auth/react";

export default function UserMenu({ username }: { username: string }) {

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/auth", // หลัง logout ไปไหน
    });
  };

  return (
    <div
      onClick={handleLogout}
      className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
    >
      <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
        {username.slice(0, 2).toUpperCase()}
      </div>

      <span className="text-sm text-slate-400">
        {username}
      </span>
    </div>
  );
}