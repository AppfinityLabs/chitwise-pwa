'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { groupsApi, membersApi, subscriptionsApi } from '@/lib/api';
import {
    ArrowLeft,
    Loader2,
    Search,
    User,
    Check,
    X,
    Calculator,
    CalendarClock,
    PieChart
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

export default function ModernEnrollMemberPage() {
    const params = useParams();
    const router = useRouter();
    const groupId = params.id as string;

    // Data State
    const [group, setGroup] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [search, setSearch] = useState('');
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [units, setUnits] = useState('1'); // Strings for consistency with select, but could be number
    const [collectionPattern, setCollectionPattern] = useState('MONTHLY');

    useEffect(() => {
        loadData();
    }, [groupId]);

    async function loadData() {
        try {
            const [groupData, membersData] = await Promise.all([
                groupsApi.get(groupId),
                membersApi.list(),
            ]);
            setGroup(groupData);
            setMembers(membersData);
            setCollectionPattern(groupData.frequency);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedMember) {
            setError('Please select a member');
            return;
        }
        setError('');
        setSubmitting(true);

        try {
            await subscriptionsApi.create({
                groupId,
                memberId: selectedMember._id,
                units: Number(units),
                collectionPattern,
            });
            router.push(`/groups/${groupId}`);
        } catch (err: any) {
            setError(err.message || 'Failed to enroll member');
            setSubmitting(false);
        }
    }

    // Filter members, but exclude if already selected (handled by UI state mostly)
    const filteredMembers = members.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase())
    );

    // --- Loading State ---
    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="animate-spin text-zinc-500" size={32} />
            </div>
        );
    }

    // --- Calculations for Summary ---
    const unitVal = Number(units);
    const totalDue = group ? group.contributionAmount * unitVal * group.totalPeriods : 0;
    const divider = collectionPattern === 'DAILY' ? 30 : collectionPattern === 'WEEKLY' ? 4 : 1;
    const periodicPayment = group ? (group.contributionAmount * unitVal) / divider : 0;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-24">

            {/* Header */}
            <header className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center gap-4">
                <Link href={`/groups/${groupId}`} className="p-2 -ml-2 rounded-full hover:bg-white/5 text-zinc-400 transition-colors">
                    <ArrowLeft size={22} />
                </Link>
                <div>
                    <h1 className="text-lg font-medium text-white">Enroll Member</h1>
                    <p className="text-xs text-zinc-500">{group?.groupName}</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="p-4 space-y-8 max-w-lg mx-auto">
                {error && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-rose-500" />
                        <p className="text-rose-200 text-sm">{error}</p>
                    </div>
                )}

                {/* 1. Member Selection Section */}
                <section className="space-y-3">
                    <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                        <User size={14} />
                        Select Member
                    </label>

                    {selectedMember ? (
                        // Selected State (Card)
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                    {selectedMember.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-white">{selectedMember.name}</p>
                                    <p className="text-xs text-indigo-300">{selectedMember.phone}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedMember(null)}
                                className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    ) : (
                        // Search State
                        <div className="space-y-2">
                            <div className="relative group">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="text"
                                    className="w-full bg-zinc-900 border border-white/5 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600"
                                    placeholder="Search name or phone..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            {/* Search Results List */}
                            <div className="max-h-60 overflow-y-auto rounded-xl border border-white/5 bg-zinc-900/50 divide-y divide-white/5">
                                {filteredMembers.length > 0 ? (
                                    filteredMembers.map((member) => (
                                        <button
                                            key={member._id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedMember(member);
                                                setSearch('');
                                            }}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left"
                                        >
                                            <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-zinc-200">{member.name}</p>
                                                <p className="text-xs text-zinc-500">{member.phone}</p>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-xs text-zinc-500">
                                        No members found
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </section>

                {/* 2. Configuration Grid */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Units Selector */}
                    <section className="space-y-3">
                        <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                            <PieChart size={14} />
                            Units Allocation
                        </label>
                        <div className="flex gap-3">
                            {['0.5', '1', '2', '3'].map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setUnits(opt)}
                                    className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${units === opt
                                        ? 'bg-zinc-100 text-zinc-900 border-zinc-100 shadow-lg shadow-white/5 scale-105'
                                        : 'bg-zinc-900 text-zinc-500 border-white/5 hover:border-white/20'
                                        }`}
                                >
                                    {opt === '0.5' ? '½' : opt}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Collection Pattern */}
                    <section className="space-y-3">
                        <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                            <CalendarClock size={14} />
                            Payment Frequency
                        </label>
                        <div className="bg-zinc-900 p-1 rounded-xl border border-white/5 flex">
                            {['DAILY', 'WEEKLY', 'MONTHLY'].map((ptn) => (
                                <button
                                    key={ptn}
                                    type="button"
                                    onClick={() => setCollectionPattern(ptn)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${collectionPattern === ptn
                                        ? 'bg-zinc-800 text-white shadow-sm'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                        }`}
                                >
                                    {ptn.charAt(0) + ptn.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                {/* 3. The Receipt (Summary) */}
                <div className="mt-8 pt-6 border-t border-dashed border-white/10">
                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 rounded-2xl p-5 border border-white/5 space-y-4">
                        <div className="flex items-center gap-2 text-indigo-400 mb-2">
                            <Calculator size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Estimate</span>
                        </div>

                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-zinc-500 text-xs mb-1">Per {collectionPattern.toLowerCase()}</p>
                                <p className="text-2xl font-light text-white">
                                    {formatCurrency(periodicPayment)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-zinc-500 text-xs mb-1">Total Contract Value</p>
                                <p className="text-lg font-medium text-zinc-300">
                                    {formatCurrency(totalDue)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Action */}
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                    {submitting ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <>
                            <span>Confirm Enrollment</span>
                            <Check size={18} />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}