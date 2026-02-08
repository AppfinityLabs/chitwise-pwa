'use client';

import { useAuth } from '@/context/AuthContext';
import {
    Trophy,
    BarChart3,
    Settings,
    LogOut,
    ChevronRight,
    User,
    ShieldCheck,
    HelpCircle,
    FileText
} from 'lucide-react';
import Link from 'next/link';

export default function ModernMorePage() {
    const { user, logout } = useAuth();

    // Grouping menu items logically
    const managementItems = [
        { href: '/winners', icon: Trophy, label: 'Winners & Draws', description: 'Manage lucky draw results' },
        { href: '/reports', icon: BarChart3, label: 'Analytics', description: 'Financial overview & stats' },
    ];

    const appItems = [
        { href: '/settings', icon: Settings, label: 'Settings', description: 'Notifications & preferences' },
        { href: '/support', icon: HelpCircle, label: 'Help & Support', description: 'Contact ChitWise team' },
    ];

    // Helper for avatar initials
    const getInitials = (name: string) => {
        return name
            ?.split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() || '??';
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-24 relative overflow-hidden">

            {/* Background Ambient Light */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-indigo-900/20 blur-3xl pointer-events-none rounded-full opacity-50" />

            {/* 1. Profile Hero Section */}
            <header className="relative z-10 pt-12 pb-8 px-6 flex flex-col items-center text-center">
                <div className="relative mb-4 group">
                    {/* Glowing Avatar */}
                    <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 shadow-2xl shadow-indigo-500/20">
                        <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center text-3xl font-bold text-white relative overflow-hidden">
                            {/* Inner Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent opacity-50" />
                            <span className="relative z-10">{getInitials(user?.name || '')}</span>
                        </div>
                    </div>

                    {/* Role Badge */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg whitespace-nowrap flex items-center gap-1.5">
                        <ShieldCheck size={10} className="text-emerald-400" />
                        {user?.role?.replace('_', ' ') || 'Admin'}
                    </div>
                </div>

                <h1 className="text-2xl font-semibold text-white tracking-tight mt-2">{user?.name || 'User'}</h1>
                <p className="text-sm text-zinc-500 font-medium">{user?.email}</p>
            </header>

            {/* 2. Menu Groups */}
            <main className="px-4 space-y-6 relative z-10">

                {/* Management Group */}
                <section className="space-y-3">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-2">Management</h3>
                    <div className="space-y-2">
                        {managementItems.map((item) => (
                            <MenuLink key={item.href} item={item} />
                        ))}
                    </div>
                </section>

                {/* App Preferences Group */}
                <section className="space-y-3">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-2">Preferences</h3>
                    <div className="space-y-2">
                        {appItems.map((item) => (
                            <MenuLink key={item.href} item={item} />
                        ))}
                    </div>
                </section>

                {/* Logout Button */}
                <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/10 active:scale-[0.98] transition-all group mt-8"
                >
                    <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                        <LogOut size={20} />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="font-medium text-rose-400">Sign Out</p>
                        <p className="text-xs text-rose-500/60">End your current session</p>
                    </div>
                </button>

                {/* Footer Info */}
                <div className="text-center pt-8 pb-4 space-y-2">
                    <div className="flex justify-center gap-4 text-xs text-zinc-600">
                        <Link href="/privacy">Privacy Policy</Link>
                        <span>•</span>
                        <Link href="/terms">Terms of Service</Link>
                    </div>
                    <p className="text-[10px] text-zinc-700">
                        ChitWise Org v1.0.0 • Build 2024.10
                    </p>
                </div>
            </main>
        </div>
    );
}

// Sub-component for Menu Items
function MenuLink({ item }: { item: any }) {
    return (
        <Link
            href={item.href}
            className="group flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-900 hover:border-white/10 active:scale-[0.98] transition-all"
        >
            <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                <item.icon size={20} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-zinc-200 group-hover:text-white transition-colors">{item.label}</p>
                <p className="text-xs text-zinc-500">{item.description}</p>
            </div>
            <ChevronRight size={18} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
        </Link>
    );
}