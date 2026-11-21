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
    <div
      className="min-h-screen text-white overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #020617 0%, #0c1a2e 40%, #0d2137 65%, #020617 100%)",
      }}
    >
      <Navbar session={session} />
      <main>{children}</main>
    </div>
  );
}
