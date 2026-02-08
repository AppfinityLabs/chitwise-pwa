'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { groupsApi, subscriptionsApi, winnersApi } from '@/lib/api';
import { ArrowLeft, Loader2, Search } from 'lucide-react';
import Link from 'next/link';

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function NewWinnerPage() {
    const router = useRouter();

    const [groups, setGroups] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedMember, setSelectedMember] = useState('');
    const [prizeAmount, setPrizeAmount] = useState('');
    const [selectionMethod, setSelectionMethod] = useState('LOTTERY');
    const [bidAmount, setBidAmount] = useState('');

    useEffect(() => {
        loadGroups();
    }, []);

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

        if (groupId) {
            const group = groups.find((g) => g._id === groupId);
            if (group) {
                const potValue = group.contributionAmount * group.totalUnits;
                const defaultPrize = potValue - group.commissionValue;
                setPrizeAmount(defaultPrize.toString());
            }

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
            const group = groups.find((g) => g._id === selectedGroup);
            await winnersApi.create({
                groupId: selectedGroup,
                groupMemberId: selectedMember,
                memberId: members.find((m) => m._id === selectedMember)?.memberId?._id,
                basePeriodNumber: group.currentPeriod,
                prizeAmount: Number(prizeAmount),
                selectionMethod,
                bidValue: selectionMethod === 'AUCTION' ? Number(bidAmount) : undefined,
            });
            router.push('/winners');
        } catch (err: any) {
            setError(err.message || 'Failed to record winner');
        } finally {
            setSubmitting(false);
        }
    }

    const selectedGroupData = groups.find((g) => g._id === selectedGroup);

    return (
        <div className="page">
            <div className="page-header flex items-center gap-3">
                <Link href="/winners" className="p-2 -ml-2 rounded-lg">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="page-title">Record Winner</h1>
                    <p className="page-subtitle">Record draw result</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="page-content space-y-4">
                {error && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Select Group */}
                <div>
                    <label className="label">Select Group *</label>
                    <select
                        className="select"
                        value={selectedGroup}
                        onChange={(e) => handleGroupChange(e.target.value)}
                        required
                    >
                        <option value="">Choose a group</option>
                        {groups.map((g) => (
                            <option key={g._id} value={g._id}>
                                {g.groupName} (Period {g.currentPeriod})
                            </option>
                        ))}
                    </select>
                </div>

                {selectedGroupData && (
                    <div className="card bg-[var(--primary)]/10 border-[var(--primary)]/20">
                        <p className="text-sm text-[var(--text-muted)]">Current Period</p>
                        <p className="text-xl font-bold">
                            Period {selectedGroupData.currentPeriod} of {selectedGroupData.totalPeriods}
                        </p>
                        <p className="text-sm text-[var(--text-muted)] mt-1">
                            Pot: {formatCurrency(selectedGroupData.contributionAmount * selectedGroupData.totalUnits)}
                        </p>
                    </div>
                )}

                {/* Select Member */}
                {selectedGroup && (
                    <div>
                        <label className="label">Select Winner *</label>
                        <div className="max-h-48 overflow-y-auto rounded-xl border border-[var(--border)]">
                            {members.length > 0 ? (
                                members.map((sub) => (
                                    <label
                                        key={sub._id}
                                        className={`flex items-center gap-3 p-3 cursor-pointer border-b border-[var(--border)] last:border-b-0 ${selectedMember === sub._id ? 'bg-[var(--primary)]/10' : ''
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="winner"
                                            value={sub._id}
                                            checked={selectedMember === sub._id}
                                            onChange={(e) => setSelectedMember(e.target.value)}
                                            className="w-4 h-4"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">{sub.memberId?.name}</p>
                                            <p className="text-sm text-[var(--text-muted)]">{sub.units} unit(s)</p>
                                        </div>
                                    </label>
                                ))
                            ) : (
                                <p className="p-4 text-center text-[var(--text-muted)]">No eligible members</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Selection Method */}
                <div>
                    <label className="label">Selection Method *</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['LOTTERY', 'AUCTION'].map((method) => (
                            <button
                                key={method}
                                type="button"
                                onClick={() => setSelectionMethod(method)}
                                className={`py-3 px-4 rounded-xl font-medium transition-colors ${selectionMethod === method
                                        ? 'bg-[var(--primary)] text-white'
                                        : 'bg-[var(--card)] text-[var(--text-muted)] border border-[var(--border)]'
                                    }`}
                            >
                                {method}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bid Amount for Auction */}
                {selectionMethod === 'AUCTION' && (
                    <div>
                        <label className="label">Bid Amount (₹) *</label>
                        <input
                            type="number"
                            className="input"
                            placeholder="Discount offered by winner"
                            value={bidAmount}
                            onChange={(e) => {
                                setBidAmount(e.target.value);
                                if (selectedGroupData) {
                                    const potValue = selectedGroupData.contributionAmount * selectedGroupData.totalUnits;
                                    const prize = potValue - selectedGroupData.commissionValue - Number(e.target.value);
                                    setPrizeAmount(prize.toString());
                                }
                            }}
                            required
                        />
                    </div>
                )}

                {/* Prize Amount */}
                <div>
                    <label className="label">Prize Amount (₹) *</label>
                    <input
                        type="number"
                        className="input text-xl font-bold"
                        value={prizeAmount}
                        onChange={(e) => setPrizeAmount(e.target.value)}
                        required
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={submitting || !selectedMember}
                        className="btn btn-primary w-full h-12"
                    >
                        {submitting ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            'Record Winner'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
