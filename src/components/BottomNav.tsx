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
    { href: '/members', icon: Users, label: 'Members' },
    { href: '/collections', icon: Wallet, label: 'History' }, // Renamed for brevity
    { href: '/more', icon: Menu, label: 'Menu' },
];

export default function BottomNav() {
    const pathname = usePathname();

    // Don't show on login page
    if (pathname === '/login') return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50">
            {/* Gradient Overlay: 
                Fades content out before it hits the nav bar for smoother scrolling 
            */}
            <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />

            {/* The Navbar: 
                Glassmorphic, border-top only, sitting on top of the gradient 
            */}
            <div className="relative bg-zinc-950/80 backdrop-blur-xl border-t border-white/5 safe-area-bottom">
                <div className="flex justify-around items-center h-16 px-2">
                    {navItems.map((item) => {
                        // Logic to determine active state
                        const isActive = pathname === item.href ||
                            (item.href !== '/' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="group relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all active:scale-95"
                            >
                                {/* Active Indicator: 
                                    A subtle glow at the top of the icon container
                                */}
                                {isActive && (
                                    <span className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_2px_8px_rgba(99,102,241,0.5)]" />
                                )}

                                {/* Icon Layer */}
                                <div className={`p-1.5 rounded-xl transition-colors ${isActive
                                    ? 'text-indigo-400 bg-indigo-500/10'
                                    : 'text-zinc-500 group-hover:text-zinc-300'
                                    }`}>
                                    <item.icon
                                        size={20}
                                        strokeWidth={isActive ? 2.5 : 1.5} // Thinner when inactive, bolder when active
                                    />
                                </div>

                                {/* Label Layer (Optional: hide on mobile, show on active?) */}
                                <span className={`text-[10px] font-medium tracking-wide transition-colors ${isActive
                                    ? 'text-zinc-200'
                                    : 'text-zinc-600'
                                    }`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}