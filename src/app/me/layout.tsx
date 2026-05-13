import { ReactNode } from 'react';
import Sidebar from '@/components/Navbar';
import UserMenu from '@/components/UserMenu';
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

interface Props {
  children: ReactNode;
}

export default async function Layout({ children }: Props) {

  const session = await getServerSession();

  if (!session?.user?.name) {
    redirect("/auth");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold">JodMe</h1>
            <Sidebar username={session.user.name} />
          </div>

          <UserMenu username={session.user.name} />
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
