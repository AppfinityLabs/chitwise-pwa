'use client';

import { useState } from 'react';
import { useWinners, useGroups } from '@/lib/swr';
import {
    Trophy,
    Plus,
    Filter,
    Sparkles,
    CheckCircle2,
    Clock,
    Crown
} from 'lucide-react';
import Link from 'next/link';

// --- Utilities ---
function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export default function ModernWinnersPage() {
    // SWR hooks - instantly shows cached data, revalidates in background
    const { data: winners = [], isLoading: winnersLoading } = useWinners();
    const { data: groups = [], isLoading: groupsLoading } = useGroups();
    const [selectedGroup, setSelectedGroup] = useState('ALL');

    const loading = winnersLoading || groupsLoading;

    const filteredWinners = selectedGroup === 'ALL'
        ? winners
        : winners.filter((w) => w.groupId?._id === selectedGroup);

    // Calculate Total Disbursed for the "Hero" stat
    const totalPrizeMoney = winners.reduce((sum, w) => sum + (w.prizeAmount || 0), 0);

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-24">

            {/* Header */}
            <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 px-4 py-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-medium text-white flex items-center gap-2">
                            Hall of Fame <Sparkles size={14} className="text-amber-400" />
                        </h1>
                        <p className="text-xs text-zinc-500">
                            Total Disbursed: <span className="text-zinc-300 font-medium">{formatCurrency(totalPrizeMoney)}</span>
                        </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                        <Trophy size={18} className="text-amber-500" />
                    </div>
                </div>

                {/* Horizontal Scroll Filter (Pills) */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4">
                    <button
                        onClick={() => setSelectedGroup('ALL')}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-all border ${selectedGroup === 'ALL'
                            ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                            : 'bg-zinc-900 text-zinc-500 border-white/5 hover:border-white/20'
                            }`}
                    >
                        All Groups
                    </button>
                    {groups.map((g) => (
                        <button
                            key={g._id}
                            onClick={() => setSelectedGroup(g._id)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-all border ${selectedGroup === g._id
                                ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                                : 'bg-zinc-900 text-zinc-500 border-white/5 hover:border-white/20'
                                }`}
                        >
                            {g.groupName}
                        </button>
                    ))}
                </div>
            </header>

            <main className="p-4 space-y-4">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-zinc-900 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredWinners.length > 0 ? (
                    <div className="grid gap-3">
                        {filteredWinners.map((winner) => (
                            <div
                                key={winner._id}
                                className="relative group overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 p-4 transition-all active:scale-[0.98]"
                            >
                                {/* Subtle Golden Gradient Background on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                <div className="relative z-10 flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        {/* Avatar Icon */}
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center text-amber-500 shadow-inner">
                                            <Crown size={22} strokeWidth={1.5} />
                                        </div>

                                        <div>
                                            <p className="font-medium text-white text-sm">
                                                {winner.memberId?.name || 'Unknown'}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider bg-zinc-800/50 px-1.5 py-0.5 rounded border border-white/5">
                                                    Period {winner.basePeriodNumber}
                                                </span>
                                                <span className="text-[10px] text-zinc-500">
                                                    • {winner.groupId?.groupName}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-lg font-medium text-amber-400">
                                            {formatCurrency(winner.prizeAmount)}
                                        </p>

                                        <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] font-medium ${winner.status === 'PAID' ? 'text-emerald-500' : 'text-zinc-500'
                                            }`}>
                                            {winner.status === 'PAID' ? (
                                                <>
                                                    <span>Paid out</span>
                                                    <CheckCircle2 size={12} />
                                                </>
                                            ) : (
                                                <>
                                                    <span>Pending</span>
                                                    <Clock size={12} />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-3xl bg-zinc-900/20">
                        <div className="h-16 w-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-white/5 shadow-inner">
                            <Trophy size={24} className="text-zinc-600" />
                        </div>
                        <p className="text-zinc-400 font-medium">No winners yet</p>
                        <p className="text-zinc-600 text-sm mt-1">
                            Select a group to filter or record a new winner.
                        </p>
                    </div>
                )}
            </main>

            {/* FAB */}
            <div className="fixed bottom-24 right-6 z-40">
                <Link
                    href="/winners/new"
                    className="h-14 w-14 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                >
                    <Plus size={28} />
                </Link>
            </div>
        </div>
    );
}