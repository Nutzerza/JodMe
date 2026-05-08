import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Sidebar from '@/components/Navbar';

interface Props {
  children: ReactNode;
  params: Promise<{ username: string }>;
}

export default async function Layout({ children, params }: Props) {

  const { username } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold">JodMe</h1>
            <Sidebar username={username} />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
              {username.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-sm text-slate-400">
              {username}
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
