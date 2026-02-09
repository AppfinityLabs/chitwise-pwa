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
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
    { href: '/', icon: Home, label: 'Dash' },
    { href: '/groups', icon: Grid3X3, label: 'Groups' },
    { href: '/members', icon: Users, label: 'Team' },
    { href: '/collections', icon: Wallet, label: 'Funds' },
    { href: '/more', icon: Menu, label: 'Me' },
];

export default function AnimatedBottomNav() {
    const pathname = usePathname();

    if (pathname === '/login') return null;

    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
            {/* Container 
                - Added 'motion.nav' for a smooth slide-up entrance animation on load
            */}
            <motion.nav
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="pointer-events-auto flex items-center gap-2 p-2 rounded-full bg-zinc-950/90 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50"
            >

                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative" // Link acts as a neutral wrapper
                        >
                            <motion.div
                                layout // KEY: This prop automatically animates width/position changes
                                transition={{
                                    type: "spring",
                                    bounce: 0.2,
                                    duration: 0.6
                                }}
                                whileTap={{ scale: 0.9 }} // Tactile tap effect
                                className={`
                                    relative flex items-center justify-center rounded-full h-12 px-4 transition-colors
                                    ${isActive
                                        ? 'bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)]'
                                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                                    }
                                `}
                            >
                                {/* Icon */}
                                <motion.div
                                    layout="position" // Ensures icon slides smoothly when text appears
                                >
                                    <item.icon
                                        size={20}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                </motion.div>

                                {/* Text Label - Only renders when active */}
                                <AnimatePresence initial={false}>
                                    {isActive && (
                                        <motion.span
                                            initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                                            animate={{ width: "auto", opacity: 1, marginLeft: 8 }}
                                            exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden whitespace-nowrap text-sm font-medium"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </Link>
                    );
                })}
            </motion.nav>
        </div>
    );
}