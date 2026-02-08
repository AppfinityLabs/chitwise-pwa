'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Grid3X3,
    Users,
    Wallet,
    Menu
} from 'lucide-react';

const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/groups', icon: Grid3X3, label: 'Groups' },
    { href: '/members', icon: Users, label: 'People' }, // Shortened label for better fit
    { href: '/collections', icon: Wallet, label: 'History' },
    { href: '/more', icon: Menu, label: 'Menu' },
];

export default function MorphingBottomNav() {
    const pathname = usePathname();

    if (pathname === '/login') return null;

    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
            {/* Glass Container 
                - Floating pill shape
                - We use pointer-events-auto so clicks work on the nav, but pass through the empty space around it
            */}
            <nav className="pointer-events-auto flex items-center gap-2 p-1.5 rounded-full bg-zinc-950/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 transition-all duration-300">

                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                relative flex items-center justify-center rounded-full h-12 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                                ${isActive
                                    ? 'bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.4)] px-5' // Wide pill when active
                                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 px-3' // Compact circle/oval when inactive
                                }
                            `}
                        >
                            <item.icon
                                size={20}
                                strokeWidth={isActive ? 2.5 : 2}
                                className="flex-shrink-0"
                            />

                            {/* Label Reveal Animation
                                - We animate max-width and opacity to create a smooth "slide out" effect
                            */}
                            <span className={`
                                overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                                ${isActive ? 'max-w-[100px] opacity-100 ml-2' : 'max-w-0 opacity-0'}
                            `}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}