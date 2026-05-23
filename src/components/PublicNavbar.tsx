'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  isAuthenticated: boolean;
}

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Search', path: '/search' },
  { name: 'Season', path: '/season' },
];

export default function PublicNavbar({ isAuthenticated }: Props) {
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

              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={active ? 'default' : 'ghost'}
                    className={active ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white'}
                  >
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        <Link href={isAuthenticated ? '/me' : '/auth'}>
          <Button className="bg-gradient-to-r from-sky-600 to-teal-500">
            {isAuthenticated ? 'My List' : 'Login'}
          </Button>
        </Link>
      </div>
    </header>
  );
}
