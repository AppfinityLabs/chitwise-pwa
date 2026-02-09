'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { groupsApi, subscriptionsApi, winnersApi } from '@/lib/api';
import {
    ArrowLeft,
    Users,
    Calendar,
    Trophy,
    Plus,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Wallet
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

export default function ModernGroupDetailPage() {
    const params = useParams();
    const router = useRouter();
    const groupId = params.id as string;

    const [group, setGroup] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [winners, setWinners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'members' | 'winners'>('members');

    useEffect(() => {
        loadData();
    }, [groupId]);

    async function loadData() {
        try {
            // In a real app, Promise.allSettled might be safer, 
            // but strictly following your logic:
            const [groupData, membersData, winnersData] = await Promise.all([
                groupsApi.get(groupId),
                subscriptionsApi.list({ groupId }),
                winnersApi.list({ groupId }),
            ]);
            setGroup(groupData);
            setMembers(membersData);
            setWinners(winnersData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    // --- Loading Skeleton ---
    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 animate-pulse" />
                    <div className="h-6 w-32 bg-zinc-900 rounded animate-pulse" />
                </div>
                <div className="h-48 bg-zinc-900 rounded-3xl animate-pulse" />
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-zinc-900 rounded-xl animate-pulse" />)}
                </div>
            </div>
        );
    }

    // --- Error State ---
    if (!group) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle size={24} className="text-zinc-500" />
                </div>
                <h1 className="text-xl font-medium text-white">Group Not Found</h1>
                <Link href="/groups" className="mt-4 text-indigo-400 text-sm hover:text-indigo-300">
                    Go back home
                </Link>
            </div>
        );
    }

    const potValue = group.contributionAmount * group.totalUnits;
    // Calculate progress for the progress bar
    const progressPercent = Math.min(100, Math.round((group.currentPeriod / group.totalPeriods) * 100));

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-24">

            {/* 1. Transparent Header */}
            <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={22} />
                </button>

                <div className="flex flex-col items-center">
                    <span className="text-sm font-medium text-white tracking-wide">{group.groupName}</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                        {group.status}
                    </span>
                </div>

                {/* Placeholder for balance/menu or empty to balance flex */}
                <div className="w-10" />
            </header>

            <main className="p-4 space-y-6">

                {/* 2. Hero Asset Card */}
                <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-white/5 p-6 shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                    <div className="relative z-10 text-center space-y-2 py-2">
                        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Total Pot Value</p>
                        <h2 className="text-4xl font-light text-white tracking-tight">
                            {formatCurrency(potValue)}
                        </h2>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/50 border border-white/5 text-xs text-zinc-400 mt-2">
                            <Calendar size={12} />
                            <span>{formatCurrency(group.contributionAmount)} / {group.frequency.toLowerCase()}</span>
                        </div>
                    </div>

                    {/* Progress Strip */}
                    <div className="mt-6 pt-4 border-t border-white/5">
                        <div className="flex justify-between text-xs text-zinc-500 mb-2">
                            <span>Period {group.currentPeriod}</span>
                            <span>Target: {group.totalPeriods}</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Secondary Stats Row */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-1">
                        <Users size={20} className="text-indigo-400 mb-1 opacity-80" strokeWidth={1.5} />
                        <span className="text-lg font-medium text-white">{members.length}<span className="text-zinc-600 text-sm">/{group.totalUnits}</span></span>
                        <span className="text-xs text-zinc-500">Members</span>
                    </div>
                    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-1">
                        <Trophy size={20} className="text-amber-400 mb-1 opacity-80" strokeWidth={1.5} />
                        <span className="text-lg font-medium text-white">{winners.length}</span>
                        <span className="text-xs text-zinc-500">Winners</span>
                    </div>
                </div>

                {/* 4. Tabs & List */}
                <div className="space-y-4">
                    {/* Custom Tab Switcher */}
                    <div className="p-1 bg-zinc-900 rounded-xl flex items-center border border-white/5">
                        <button
                            onClick={() => setActiveTab('members')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'members'
                                ? 'bg-zinc-800 text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            Members
                        </button>
                        <button
                            onClick={() => setActiveTab('winners')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'winners'
                                ? 'bg-zinc-800 text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            Winners
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="space-y-3 min-h-[200px]">
                        {activeTab === 'members' && (
                            members.length > 0 ? (
                                members.map((sub) => {
                                    const isOverdue = sub.overdueAmount > 0;
                                    return (
                                        <Link
                                            key={sub._id}
                                            href={`/collections/new?subscription=${sub._id}`}
                                            className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${isOverdue
                                                ? 'bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10'
                                                : 'bg-zinc-900/20 border-white/5 hover:bg-zinc-900/40'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isOverdue ? 'bg-rose-500/10 text-rose-400' : 'bg-zinc-800 text-zinc-400'
                                                    }`}>
                                                    {sub.memberId?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-medium ${isOverdue ? 'text-rose-200' : 'text-zinc-200'}`}>
                                                        {sub.memberId?.name || 'Unknown'}
                                                    </p>
                                                    <p className="text-xs text-zinc-500">{sub.units} unit(s)</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    {isOverdue ? (
                                                        <>
                                                            <p className="text-sm font-medium text-rose-400">{formatCurrency(sub.overdueAmount)}</p>
                                                            <p className="text-[10px] text-rose-500/80">Overdue</p>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center gap-1 text-emerald-500/80">
                                                            <CheckCircle2 size={16} />
                                                            <span className="text-xs font-medium">Paid</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400" />
                                            </div>
                                        </Link>
                                    );
                                })
                            ) : (
                                <EmptyState
                                    icon={Users}
                                    label="No members yet"
                                    actionLabel="Add Member"
                                    actionLink={`/groups/${groupId}/enroll`}
                                />
                            )
                        )}

                        {activeTab === 'winners' && (
                            winners.length > 0 ? (
                                winners.map((winner) => (
                                    <div key={winner._id} className="flex items-center justify-between p-4 rounded-2xl border border-amber-500/10 bg-amber-500/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                <Trophy size={18} fill="currentColor" className="opacity-80" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-zinc-200">{winner.memberId?.name}</p>
                                                <p className="text-xs text-zinc-500">Period {winner.basePeriodNumber}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-amber-400">{formatCurrency(winner.prizeAmount)}</p>
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{winner.status}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState icon={Trophy} label="No draws conducted yet" />
                            )
                        )}
                    </div>
                </div>

            </main>

            {/* FAB - Only on Members Tab */}
            {activeTab === 'members' && (
                <div className="fixed bottom-24 right-6 z-40">
                    <Link
                        href={`/groups/${groupId}/enroll`}
                        className="h-14 w-14 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                    >
                        <Plus size={28} />
                    </Link>
                </div>
            )}
        </div>
    );
}

// --- Sub Components ---

function EmptyState({ icon: Icon, label, actionLabel, actionLink }: any) {
    return (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-white/10 rounded-2xl bg-zinc-900/20">
            <Icon size={32} className="text-zinc-600 mb-3" strokeWidth={1.5} />
            <p className="text-zinc-500 text-sm mb-4">{label}</p>
            {actionLabel && actionLink && (
                <Link
                    href={actionLink}
                    className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}