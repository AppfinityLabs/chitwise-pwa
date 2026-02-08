'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { membersApi, subscriptionsApi } from '@/lib/api';
import {
    ArrowLeft,
    Phone,
    Mail,
    MapPin,
    ChevronRight,
    Wallet,
    ShieldCheck,
    AlertCircle,
    Clock,
    LayoutGrid,
    UserX
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

function getInitials(name: string) {
    return name
        ?.split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || '??';
}

export default function ModernMemberDetailPage() {
    const params = useParams();
    const router = useRouter();
    const memberId = params.id as string;

    const [member, setMember] = useState<any>(null);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [memberId]);

    async function loadData() {
        try {
            const [memberData, subsData] = await Promise.all([
                membersApi.get(memberId),
                subscriptionsApi.list({ memberId }),
            ]);
            setMember(memberData);
            setSubscriptions(subsData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    // --- Loading State ---
    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col p-6 gap-8">
                <div className="h-8 w-8 bg-zinc-900 rounded-full animate-pulse" />
                <div className="flex flex-col items-center gap-4">
                    <div className="h-24 w-24 rounded-full bg-zinc-900 animate-pulse" />
                    <div className="h-6 w-40 bg-zinc-900 rounded animate-pulse" />
                </div>
                <div className="h-32 bg-zinc-900 rounded-2xl animate-pulse" />
            </div>
        );
    }

    // --- Error State ---
    if (!member) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center p-6">
                <div className="h-16 w-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                    <UserX size={24} className="text-zinc-500" />
                </div>
                <h1 className="text-lg font-medium text-white">Member Not Found</h1>
                <Link href="/members" className="mt-4 text-indigo-400 text-sm">Return to Directory</Link>
            </div>
        );
    }

    const totalPending = subscriptions.reduce((sum, s) => sum + (s.pendingAmount || 0), 0);
    const isClean = totalPending === 0;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-24 relative overflow-hidden">

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />

            {/* Header */}
            <header className="relative z-10 px-4 py-4">
                <Link href="/members" className="inline-flex p-2 -ml-2 rounded-full hover:bg-white/10 text-zinc-300 transition-colors">
                    <ArrowLeft size={24} />
                </Link>
            </header>

            <main className="relative z-10 px-4 space-y-8">

                {/* 1. Identity Hero */}
                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-indigo-500/20">
                            {getInitials(member.name)}
                        </div>
                        {/* Status Indicator */}
                        <div className={`absolute bottom-0 right-0 px-2 py-0.5 rounded-full border-2 border-zinc-950 text-[10px] font-bold uppercase tracking-wider ${member.status === 'ACTIVE'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-amber-500 text-white'
                            }`}>
                            {member.status}
                        </div>
                    </div>

                    <h1 className="text-2xl font-semibold text-white tracking-tight">{member.name}</h1>

                    {/* Quick Action Grid */}
                    <div className="flex items-center gap-4 mt-6">
                        <ActionCircle href={`tel:${member.phone}`} icon={Phone} label="Call" />
                        {member.email && (
                            <ActionCircle href={`mailto:${member.email}`} icon={Mail} label="Email" />
                        )}
                        {member.address && (
                            <ActionCircle href={`https://maps.google.com/?q=${member.address}`} icon={MapPin} label="Map" target="_blank" />
                        )}
                    </div>
                </div>

                {/* 2. Financial Overview Card */}
                <div className={`relative overflow-hidden rounded-3xl border p-6 flex flex-col items-center gap-1 ${isClean
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-rose-500/5 border-rose-500/20'
                    }`}>
                    <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">Total Outstanding</span>
                    <h2 className={`text-4xl font-light tracking-tight my-2 ${isClean ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                        {formatCurrency(totalPending)}
                    </h2>

                    <div className="flex items-center gap-2 text-xs">
                        {isClean ? (
                            <>
                                <ShieldCheck size={14} className="text-emerald-500" />
                                <span className="text-emerald-500/80">All dues cleared</span>
                            </>
                        ) : (
                            <>
                                <AlertCircle size={14} className="text-rose-500" />
                                <span className="text-rose-500/80">Payment required</span>
                            </>
                        )}
                    </div>
                </div>

                {/* 3. Subscriptions / Assets */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-sm font-medium text-zinc-400">Portfolio ({subscriptions.length})</h3>
                    </div>

                    {subscriptions.length > 0 ? (
                        <div className="space-y-3">
                            {subscriptions.map((sub) => {
                                const hasDues = sub.overdueAmount > 0;
                                return (
                                    <Link
                                        key={sub._id}
                                        href={`/collections/new?subscription=${sub._id}`}
                                        className="group block bg-zinc-900/50 border border-white/5 rounded-2xl p-4 transition-all hover:bg-zinc-900 active:scale-[0.98]"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                                                    <LayoutGrid size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">
                                                        {sub.groupId?.groupName || 'Unknown Group'}
                                                    </p>
                                                    <p className="text-xs text-zinc-500">
                                                        {sub.units} Unit(s) • {sub.collectionPattern}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight size={18} className="text-zinc-600" />
                                        </div>

                                        {/* Mini Status Bar */}
                                        <div className={`flex items-center justify-between p-3 rounded-xl text-xs font-medium ${hasDues
                                                ? 'bg-rose-500/10 text-rose-300'
                                                : 'bg-emerald-500/10 text-emerald-300'
                                            }`}>
                                            <div className="flex items-center gap-2">
                                                {hasDues ? <Clock size={14} /> : <ShieldCheck size={14} />}
                                                <span>{hasDues ? 'Payment Overdue' : 'Up to date'}</span>
                                            </div>
                                            <span>{hasDues ? formatCurrency(sub.overdueAmount) : 'Active'}</span>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl">
                            <Wallet size={32} className="text-zinc-600 mx-auto mb-3" strokeWidth={1.5} />
                            <p className="text-zinc-500 text-sm">No active subscriptions</p>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}

// --- Sub Component: Quick Action Circle ---
function ActionCircle({ href, icon: Icon, label, target }: any) {
    return (
        <a
            href={href}
            target={target}
            className="flex flex-col items-center gap-2 group"
        >
            <div className="h-12 w-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500 transition-all duration-300 shadow-lg shadow-black/50">
                <Icon size={20} />
            </div>
            <span className="text-[10px] font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors">
                {label}
            </span>
        </a>
    );
}