'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface Props {
    username: string;
}

export default function Sidebar({ username }: Props) {
    const pathname = usePathname();

    const menus = [
        { name: 'My List', path: `/u/${username}/mylist` },
        { name: 'Search', path: `/u/${username}/search` },
        { name: 'Season', path: `/u/${username}/season` },
        { name: 'Stats', path: `/u/${username}/stats` },
    ];

    return (
        <nav className="flex gap-2">
            {menus.map((menu) => {
                const isActive = pathname === menu.path;

                return (
                    <Link key={menu.path} href={menu.path}>
                        <Button
                            variant={isActive ? 'default' : 'ghost'}
                            className={isActive ? 'bg-slate-800' : ''}
                        >
                            {menu.name}
                        </Button>
                    </Link>
                );
            })}
        </nav>
    );
}
