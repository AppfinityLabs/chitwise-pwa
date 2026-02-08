'use client';

import { useAuth } from '@/context/AuthContext';
import { Trophy, BarChart3, Settings, LogOut, ChevronRight, User } from 'lucide-react';
import Link from 'next/link';

export default function MorePage() {
    const { user, logout } = useAuth();

    const menuItems = [
        { href: '/winners', icon: Trophy, label: 'Winners', description: 'Manage draw winners' },
        { href: '/reports', icon: BarChart3, label: 'Reports', description: 'View analytics' },
        { href: '/settings', icon: Settings, label: 'Settings', description: 'App preferences' },
    ];

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">More</h1>
            </div>

            <div className="page-content space-y-4">
                {/* User Card */}
                <div className="card flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[var(--primary)]/20 flex items-center justify-center">
                        <User size={28} className="text-[var(--primary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-lg truncate">{user?.name || 'User'}</p>
                        <p className="text-sm text-[var(--text-muted)] truncate">{user?.email}</p>
                        <span className="badge mt-1">{user?.role?.replace('_', ' ')}</span>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="rounded-xl overflow-hidden">
                    {menuItems.map((item) => (
                        <Link key={item.href} href={item.href} className="list-item">
                            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                                <item.icon size={20} className="text-[var(--primary)]" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">{item.label}</p>
                                <p className="text-sm text-[var(--text-muted)]">{item.description}</p>
                            </div>
                            <ChevronRight size={20} className="text-[var(--text-muted)]" />
                        </Link>
                    ))}
                </div>

                {/* Logout */}
                <button
                    onClick={() => logout()}
                    className="list-item w-full text-left rounded-xl"
                >
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <LogOut size={20} className="text-red-500" />
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-red-500">Logout</p>
                        <p className="text-sm text-[var(--text-muted)]">Sign out of your account</p>
                    </div>
                </button>

                {/* Version */}
                <p className="text-center text-xs text-[var(--text-muted)] pt-4">
                    ChitWise Org v1.0.0
                </p>
            </div>
        </div>
    );
}
