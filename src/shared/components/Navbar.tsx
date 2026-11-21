// This component renders the navigation bar for the application.
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
// NextAuth for authentication handling (sign out)
import { signOut } from "next-auth/react";
// UI components for the navigation bar (buttons, links)
import { Button } from "@/shared/components/ui/button";
// Constants and types for navigation items and session user
import { navItems } from "@/shared/constants/constants";
import type { SessionUser } from "@/features/auth/types/type";

export function Navbar({ session }: { session: SessionUser }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-sky-900/30 bg-[#020617]/70 backdrop-blur sticky top-0 z-40">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-teal-400" />
            <span className="text-2xl font-bold text-white">JodMe</span>
          </Link>

          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const active = pathname === item.path;
              if (session?.user && item.path === "/") return null; // Skip rendering the "Home" link in the navbar
              if (!session?.user && item.path === "/me") return null; // Skip rendering the "My List" link for unauthenticated users
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={active ? "default" : "ghost"}
                    className={
                      active
                        ? "bg-slate-800 text-white"
                        : "text-slate-300 hover:text-white"
                    }
                  >
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        {session?.user ? (
          <div className="flex items-center gap-2">
            <Link href="/me">
              <Button className="bg-linear-to-r from-sky-600 to-teal-500">
                {session.user.username ?? "My List"}
              </Button>
            </Link>

            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Logout
            </Button>
          </div>
        ) : (
          <Link href="/auth">
            <Button className="bg-linear-to-r from-sky-600 to-teal-500">
              Login
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
