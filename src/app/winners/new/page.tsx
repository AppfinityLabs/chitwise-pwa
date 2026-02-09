'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { groupsApi, subscriptionsApi, winnersApi } from '@/lib/api';
import {
    ArrowLeft,
    Loader2,
    Trophy,
    Gavel,
    Sparkles,
    Calculator,
    Crown,
    ChevronDown,
    Coins
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

export default function ModernNewWinnerPage() {
    const router = useRouter();

    // Data State
    const [groups, setGroups] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedMember, setSelectedMember] = useState('');
    const [prizeAmount, setPrizeAmount] = useState<number>(0);
    const [selectionMethod, setSelectionMethod] = useState<'LOTTERY' | 'AUCTION'>('LOTTERY');
    const [bidAmount, setBidAmount] = useState<string>('');

    // Derived State
    const activeGroup = groups.find((g) => g._id === selectedGroup);
    const activeMember = members.find((m) => m._id === selectedMember);

    useEffect(() => {
        loadGroups();
    }, []);

    // Recalculate Prize whenever dependencies change
    useEffect(() => {
        if (!activeGroup) return;

        const potValue = activeGroup.contributionAmount * activeGroup.totalUnits;
        const commission = activeGroup.commissionValue;
        const bid = Number(bidAmount) || 0;

        // Formula: Pot - Commission - Bid = Prize
        const calculatedPrize = potValue - commission - bid;
        setPrizeAmount(calculatedPrize > 0 ? calculatedPrize : 0);

    }, [activeGroup, bidAmount, selectionMethod]);

    async function loadGroups() {
        try {
            const data = await groupsApi.list();
            setGroups(data.filter((g: any) => g.status === 'ACTIVE'));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleGroupChange(groupId: string) {
        setSelectedGroup(groupId);
        setSelectedMember('');
        setMembers([]);
        setBidAmount('');

        if (groupId) {
            const subs = await subscriptionsApi.list({ groupId });
            setMembers(subs);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedGroup || !selectedMember) {
            setError('Please select group and member');
            return;
        }
        setError('');
        setSubmitting(true);

        try {
            await winnersApi.create({
                groupId: selectedGroup,
                groupMemberId: selectedMember,
                memberId: activeMember?.memberId?._id,
                basePeriodNumber: activeGroup.currentPeriod,
                prizeAmount: prizeAmount,
                selectionMethod,
                bidValue: selectionMethod === 'AUCTION' ? Number(bidAmount) : undefined,
            });
            router.push('/winners');
        } catch (err: any) {
            setError(err.message || 'Failed to record winner');
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-24">

            {/* Header */}
            <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/5 text-zinc-400 transition-colors">
                    <ArrowLeft size={22} />
                </button>
                <div>
                    <h1 className="text-lg font-medium text-white">Declare Winner</h1>
                    <p className="text-xs text-zinc-500">Record Draw Result</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="p-4 max-w-lg mx-auto space-y-8">
                {error && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-rose-500" />
                        <p className="text-rose-200 text-sm">{error}</p>
                    </div>
                )}

                {/* 1. Group Selector (The Stage) */}
                <section className="space-y-3">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider pl-1">Select Group</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                            <Coins size={18} />
                        </div>
                        <select
                            className="w-full appearance-none bg-zinc-900 border border-white/10 text-white rounded-2xl py-4 pl-11 pr-10 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all cursor-pointer"
                            value={selectedGroup}
                            onChange={(e) => handleGroupChange(e.target.value)}
                            required
                        >
                            <option value="" disabled>Choose a Chit Group</option>
                            {groups.map((g) => (
                                <option key={g._id} value={g._id}>
                                    {g.groupName} (Period {g.currentPeriod})
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                    </div>
                </section>

                {/* 2. The Pot (Context Card) - Only shows when group selected */}
                {activeGroup && (
                    <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 p-6">
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <Trophy size={64} className="text-amber-500" />
                            </div>
                            <p className="text-amber-500/80 text-xs font-bold uppercase tracking-widest mb-1">Total Pot Value</p>
                            <h2 className="text-3xl font-medium text-amber-400">
                                {formatCurrency(activeGroup.contributionAmount * activeGroup.totalUnits)}
                            </h2>
                            <div className="mt-4 flex gap-4 text-xs text-zinc-400">
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                                    Period {activeGroup.currentPeriod}/{activeGroup.totalPeriods}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                                    Commission: {formatCurrency(activeGroup.commissionValue)}
                                </span>
                            </div>
                        </div>

                        {/* 3. The Winner & Method */}
                        <div className="mt-8 space-y-6">

                            {/* Member Selector */}
                            <div className="space-y-3">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider pl-1">Winner</label>
                                <div className="max-h-48 overflow-y-auto rounded-2xl border border-white/5 bg-zinc-900/50 divide-y divide-white/5">
                                    {members.length > 0 ? (
                                        members.map((sub) => (
                                            <label
                                                key={sub._id}
                                                className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${selectedMember === sub._id ? 'bg-amber-500/10' : 'hover:bg-white/5'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="winner"
                                                    value={sub._id}
                                                    checked={selectedMember === sub._id}
                                                    onChange={(e) => setSelectedMember(e.target.value)}
                                                    className="sr-only"
                                                />
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${selectedMember === sub._id
                                                    ? 'bg-amber-500 text-black scale-110'
                                                    : 'bg-zinc-800 text-zinc-500'
                                                    }`}>
                                                    {selectedMember === sub._id ? <Crown size={14} /> : sub.memberId?.name.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-sm font-medium ${selectedMember === sub._id ? 'text-amber-400' : 'text-zinc-200'}`}>
                                                        {sub.memberId?.name}
                                                    </p>
                                                    <p className="text-xs text-zinc-500">{sub.units} unit(s)</p>
                                                </div>
                                                {selectedMember === sub._id && (
                                                    <Sparkles size={16} className="text-amber-500 animate-pulse" />
                                                )}
                                            </label>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-xs text-zinc-500">Loading members...</div>
                                    )}
                                </div>
                            </div>

                            {/* Method Toggle */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectionMethod('LOTTERY')}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${selectionMethod === 'LOTTERY'
                                        ? 'bg-zinc-100 text-zinc-900 border-zinc-100 shadow-lg'
                                        : 'bg-zinc-900 text-zinc-500 border-white/5 hover:bg-zinc-800'
                                        }`}
                                >
                                    <Sparkles size={20} />
                                    <span className="text-xs font-bold">Lottery Draw</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectionMethod('AUCTION')}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${selectionMethod === 'AUCTION'
                                        ? 'bg-zinc-100 text-zinc-900 border-zinc-100 shadow-lg'
                                        : 'bg-zinc-900 text-zinc-500 border-white/5 hover:bg-zinc-800'
                                        }`}
                                >
                                    <Gavel size={20} />
                                    <span className="text-xs font-bold">Auction Bid</span>
                                </button>
                            </div>

                            {/* Auction Bid Input */}
                            {selectionMethod === 'AUCTION' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider pl-1">Bid Discount</label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-lg">₹</span>
                                        <input
                                            type="number"
                                            className="w-full bg-zinc-900 border border-white/10 text-white rounded-2xl py-4 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all text-lg font-medium placeholder:text-zinc-700"
                                            placeholder="Enter bid amount"
                                            value={bidAmount}
                                            onChange={(e) => setBidAmount(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {/* 4. The Calculation Receipt */}
                            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 space-y-3">
                                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                                    <Calculator size={14} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Payout Breakdown</span>
                                </div>

                                <div className="flex justify-between text-xs text-zinc-500">
                                    <span>Total Pot</span>
                                    <span>{formatCurrency(activeGroup.contributionAmount * activeGroup.totalUnits)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-zinc-500">
                                    <span>Commission (-)</span>
                                    <span>{formatCurrency(activeGroup.commissionValue)}</span>
                                </div>
                                {selectionMethod === 'AUCTION' && (
                                    <div className="flex justify-between text-xs text-rose-400">
                                        <span>Bid Discount (-)</span>
                                        <span>{formatCurrency(Number(bidAmount) || 0)}</span>
                                    </div>
                                )}
                                <div className="border-t border-white/5 pt-3 mt-1 flex justify-between items-end">
                                    <span className="text-sm font-medium text-zinc-300">Net Prize</span>
                                    <span className="text-xl font-bold text-amber-400">{formatCurrency(prizeAmount)}</span>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={submitting || !selectedMember}
                                className="w-full h-14 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl font-bold shadow-[0_4px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : (
                                    <>
                                        <Trophy size={20} />
                                        <span>Confirm Winner</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}