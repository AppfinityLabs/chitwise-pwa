'use client';

import { useState, useMemo } from 'react';
import { useMembers } from '@/lib/swr';
import {
    Plus,
    Search,
    ChevronRight,
    Phone,
    MoreVertical,
    Users,
    UserCheck,
    UserX
} from 'lucide-react';
import Link from 'next/link';

export default function ModernMembersPage() {
    // SWR hook - instantly shows cached data, revalidates in background
    const { data: rawMembers = [], isLoading: loading } = useMembers();
    const [search, setSearch] = useState('');

    // Sort alphabetically by name (memoized)
    const members = useMemo(() =>
        [...rawMembers].sort((a: any, b: any) => a.name?.localeCompare(b.name) || 0),
        [rawMembers]
    );

    // Filter logic
    const filteredMembers = members.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.phone.includes(search)
    );

    // Group by First Letter (The "Contacts App" Logic)
    const groupedMembers = filteredMembers.reduce((groups: any, member) => {
        const letter = member.name.charAt(0).toUpperCase();
        if (!groups[letter]) groups[letter] = [];
        groups[letter].push(member);
        return groups;
    }, {});

    const sortedKeys = Object.keys(groupedMembers).sort();

    // Stats Calculation
    const activeCount = members.filter(m => m.status === 'ACTIVE').length;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-24">

            {/* 1. Header & Stats */}
            <header className="pt-6 px-6 pb-2 space-y-4">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-white">Members</h1>
                        <p className="text-zinc-500 text-sm mt-1">Directory</p>
                    </div>

                    {/* Mini Stats Pill */}
                    <div className="flex items-center gap-3 text-xs font-medium">
                        <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            <UserCheck size={12} />
                            <span>{activeCount} Active</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-full border border-white/10">
                            <Users size={12} />
                            <span>{members.length} Total</span>
                        </div>
                    </div>
                </div>

                {/* Search Bar - Floating Glass */}
                <div className="relative group pt-2">
                    <div className="absolute inset-y-0 left-3 top-2 flex items-center pointer-events-none">
                        <Search size={18} className="text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="w-full bg-zinc-900/50 border border-white/5 text-sm text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:bg-zinc-900 transition-all placeholder:text-zinc-600"
                        placeholder="Search by name or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </header>

            {/* 2. The List */}
            <div className="px-4">
                {loading ? (
                    <div className="space-y-4 mt-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-2 animate-pulse">
                                <div className="h-10 w-10 rounded-full bg-zinc-900" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 w-32 bg-zinc-900 rounded" />
                                    <div className="h-3 w-20 bg-zinc-900 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredMembers.length > 0 ? (
                    <div className="space-y-2 mt-2">
                        {sortedKeys.map((letter) => (
                            <div key={letter} className="relative">
                                {/* Sticky Letter Header */}
                                <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-md py-2 px-2 text-xs font-bold text-indigo-500 border-b border-white/5 mb-1">
                                    {letter}
                                </div>

                                <div className="bg-zinc-900/20 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                                    {groupedMembers[letter].map((member: any) => (
                                        <Link
                                            key={member._id}
                                            href={`/members/${member._id}`}
                                            className="group flex items-center justify-between p-3 hover:bg-zinc-800/50 transition-colors active:bg-zinc-800"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                {/* Avatar with Status Dot */}
                                                <div className="relative">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    {/* Status Indicator */}
                                                    <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-950 ${member.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'
                                                        }`} />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="font-medium text-zinc-200 truncate group-hover:text-white transition-colors">
                                                        {member.name}
                                                    </p>
                                                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                                                        <Phone size={10} />
                                                        {member.phone}
                                                    </p>
                                                </div>
                                            </div>

                                            <ChevronRight size={18} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="h-16 w-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-white/5">
                            <Search size={24} className="text-zinc-600" />
                        </div>
                        <p className="text-zinc-400 font-medium">No members found</p>
                        <p className="text-zinc-600 text-sm mt-1">
                            Add a new member to get started.
                        </p>
                    </div>
                )}
            </div>

            {/* FAB */}
            <div className="fixed bottom-24 right-6 z-40">
                <Link
                    href="/members/new"
                    className="h-14 w-14 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                >
                    <Plus size={28} />
                </Link>
            </div>
        </div>
    );
}