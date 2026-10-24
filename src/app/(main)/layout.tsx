// Main layout for the application, including the Navbar and main content area
import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
// Import authentication options and session user type
import { authOptions } from "@/features/auth/lib/authOptions";
import type { SessionUser } from "@/features/auth/types/type";
// Import Navbar component
import { Navbar } from "@/shared/components/Navbar";

export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = (await getServerSession(authOptions)) as SessionUser;

  return (
    <div className="min-h-screen bg-linear-to-b from-[#020617] via-[#0c1a2e]/80 to-[#020617] text-white overflow-hidden">
      <Navbar session={session} />
      <main>{children}</main>
    </div>
  );
}
