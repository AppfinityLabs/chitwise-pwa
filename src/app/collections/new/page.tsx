'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { collectionsApi } from '@/lib/api';
import { useSubscriptions, invalidateAfterCollectionCreate } from '@/lib/swr';
import {
    ArrowLeft,
    Loader2,
    Search,
    CheckCircle2,
    X,
    Smartphone,
    Banknote,
    CreditCard,
    Landmark,
    Receipt,
    ArrowRight,
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

function NewCollectionForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preSelectedSub = searchParams.get('subscription');

    // SWR Hook
    const { data: subscriptions = [], isLoading: loading } = useSubscriptions();

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [search, setSearch] = useState('');

    // Form State
    const [selectedSub, setSelectedSub] = useState<string>(preSelectedSub || '');
    const [amountPaid, setAmountPaid] = useState('');
    const [paymentMode, setPaymentMode] = useState('CASH');
    const [remarks, setRemarks] = useState('');

    // Period State
    const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
    const [periodInfo, setPeriodInfo] = useState<{
        nextPeriod: number;
        currentPeriod: number;
        totalPeriods: number;
        collectionFactor: number;
        periods: Array<{ period: number; collected: number; total: number; isComplete: boolean }>;
    } | null>(null);
    const [periodLoading, setPeriodLoading] = useState(false);

    // Fetch next available period when subscription is selected
    useEffect(() => {
        if (!selectedSub) {
            setPeriodInfo(null);
            return;
        }
        setPeriodLoading(true);
        collectionsApi.nextPeriod(selectedSub)
            .then((data) => {
                setPeriodInfo(data);
                setSelectedPeriod(data.nextPeriod);
            })
            .catch((err) => {
                console.error('Failed to fetch period info:', err);
                // Fallback to group's currentPeriod
                const sub = subscriptions.find((s) => s._id === selectedSub);
                setSelectedPeriod(sub?.groupId?.currentPeriod || 1);
            })
            .finally(() => setPeriodLoading(false));
    }, [selectedSub, subscriptions]);

    // Derived State
    const selectedSubscription = useMemo(() =>
        subscriptions.find((s) => s._id === selectedSub),
        [subscriptions, selectedSub]
    );

    // Auto-fill amount if pre-selected via URL
    useMemo(() => {
        if (preSelectedSub && subscriptions.length > 0 && !amountPaid) {
            const sub = subscriptions.find((s: any) => s._id === preSelectedSub);
            if (sub) {
                const dueAmount = (sub.groupId?.contributionAmount * sub.units) / sub.collectionFactor;
                setAmountPaid(Math.round(dueAmount).toString());
            }
        }
    }, [preSelectedSub, subscriptions, amountPaid]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedSub) {
            setError('Select a member first');
            return;
        }
        setError('');
        setSubmitting(true);

        try {
            const sub = subscriptions.find((s) => s._id === selectedSub);
            await collectionsApi.create({
                groupMemberId: selectedSub,
                basePeriodNumber: selectedPeriod,
                amountPaid: Number(amountPaid),
                paymentMode,
                remarks,
            });
            // Update dashboard and collections list immediately
            await invalidateAfterCollectionCreate(sub?.groupId?._id);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Transaction failed');
            setSubmitting(false);
        }
    }

    const filteredSubs = subscriptions.filter((s) =>
        s.memberId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.groupId?.groupName?.toLowerCase().includes(search.toLowerCase())
    );

    // --- Success State (Receipt View) ---
    if (success) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-sm bg-zinc-900 border border-white/5 rounded-3xl p-8 relative overflow-hidden">
                    {/* Decorative Top */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-emerald-500" />

                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
                            <CheckCircle2 size={32} />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Payment Received</h2>
                        <p className="text-zinc-500 text-sm">{new Date().toLocaleString()}</p>
                    </div>

                    <div className="space-y-4 border-t border-dashed border-white/10 pt-6">
                        <div className="flex justify-between">
                            <span className="text-zinc-500 text-sm">Amount</span>
                            <span className="text-2xl font-medium text-white">{formatCurrency(Number(amountPaid))}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Payer</span>
                            <span className="text-zinc-300">{selectedSubscription?.memberId?.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Method</span>
                            <span className="text-zinc-300">{paymentMode}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/collections')}
                        className="w-full mt-8 h-12 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-24">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/5 text-zinc-400 transition-colors">
                    <ArrowLeft size={22} />
                </button>
                <h1 className="text-lg font-medium text-white">Receive Payment</h1>
            </header>

            <form onSubmit={handleSubmit} className="p-4 max-w-lg mx-auto space-y-8">
                {error && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 animate-in slide-in-from-top-2">
                        <div className="h-2 w-2 rounded-full bg-rose-500" />
                        <p className="text-rose-200 text-sm">{error}</p>
                    </div>
                )}

                {/* 1. Who is paying? (Selector) */}
                <section>
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 block">From</label>

                    {selectedSubscription ? (
                        // Selected State (Ticket)
                        <div className="relative group bg-zinc-900 border border-indigo-500/30 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_15px_rgba(79,70,229,0.1)]">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                    {selectedSubscription.memberId?.name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-white">{selectedSubscription.memberId?.name}</p>
                                    <p className="text-xs text-indigo-300">{selectedSubscription.groupId?.groupName}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedSub('');
                                    setSearch('');
                                    setAmountPaid('');
                                }}
                                className="p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-rose-400 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    ) : (
                        // Search State
                        <div className="relative">
                            <div className="relative group z-10">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="text"
                                    className="w-full bg-zinc-900 border border-white/5 text-white rounded-xl py-3.5 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600"
                                    placeholder="Search name or group..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            {/* Dropdown List */}
                            {search && (
                                <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-20 divide-y divide-white/5">
                                    {filteredSubs.length > 0 ? (
                                        filteredSubs.map((sub) => (
                                            <button
                                                key={sub._id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedSub(sub._id);
                                                    const dueAmount = (sub.groupId?.contributionAmount * sub.units) / sub.collectionFactor;
                                                    setAmountPaid(Math.round(dueAmount).toString());
                                                }}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left"
                                            >
                                                <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400">
                                                    {sub.memberId?.name?.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-zinc-200">{sub.memberId?.name}</p>
                                                    <p className="text-xs text-zinc-500">{sub.groupId?.groupName}</p>
                                                </div>
                                                {sub.overdueAmount > 0 && (
                                                    <span className="text-[10px] font-bold text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-full">
                                                        ₹{sub.overdueAmount} due
                                                    </span>
                                                )}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-xs text-zinc-500">No results found</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* 2. Period Selector */}
                {selectedSubscription && (
                    <section>
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 block">Period</label>
                        {periodLoading ? (
                            <div className="flex items-center gap-2 text-zinc-500 text-sm">
                                <Loader2 size={16} className="animate-spin" />
                                <span>Loading periods...</span>
                            </div>
                        ) : periodInfo ? (
                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    {periodInfo.periods.map((p) => (
                                        <button
                                            key={p.period}
                                            type="button"
                                            disabled={p.isComplete}
                                            onClick={() => setSelectedPeriod(p.period)}
                                            className={`relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                                selectedPeriod === p.period
                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-105'
                                                    : p.isComplete
                                                        ? 'bg-zinc-900/50 text-zinc-600 border border-white/5 cursor-not-allowed line-through'
                                                        : 'bg-zinc-900 text-zinc-300 border border-white/5 hover:bg-zinc-800 hover:border-indigo-500/30'
                                            }`}
                                        >
                                            P{p.period}
                                            {p.isComplete && (
                                                <span className="absolute -top-1 -right-1">
                                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-zinc-500">
                                    Period {selectedPeriod} — {periodInfo.periods.find(p => p.period === selectedPeriod)?.collected || 0}/{periodInfo.collectionFactor} collected
                                </p>
                            </div>
                        ) : (
                            <div className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-3">
                                <p className="text-sm text-zinc-400">Period {selectedPeriod}</p>
                            </div>
                        )}
                    </section>
                )}

                {/* 3. How much? (Big Input) */}
                <section className="flex flex-col items-center py-4">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Amount</span>
                    <div className="relative w-full max-w-[240px]">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-4xl font-light text-zinc-600">₹</span>
                        <input
                            type="number"
                            className="w-full bg-transparent text-6xl font-light text-center text-white focus:outline-none placeholder:text-zinc-800"
                            placeholder="0"
                            value={amountPaid}
                            onChange={(e) => setAmountPaid(e.target.value)}
                            required
                            min="1"
                        />
                    </div>
                    {selectedSubscription && (
                        <button
                            type="button"
                            onClick={() => {
                                const due = (selectedSubscription.groupId?.contributionAmount * selectedSubscription.units) / selectedSubscription.collectionFactor;
                                setAmountPaid(Math.round(due).toString());
                            }}
                            className="mt-4 text-xs bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                        >
                            Set Full Due: {formatCurrency((selectedSubscription.groupId?.contributionAmount * selectedSubscription.units) / selectedSubscription.collectionFactor)}
                        </button>
                    )}
                </section>

                {/* 4. Payment Method (Grid) */}
                <section>
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 block">Method</label>
                    <div className="grid grid-cols-2 gap-3">
                        <PaymentModeButton
                            mode="CASH"
                            current={paymentMode}
                            set={setPaymentMode}
                            icon={Banknote}
                            label="Cash"
                        />
                        <PaymentModeButton
                            mode="UPI"
                            current={paymentMode}
                            set={setPaymentMode}
                            icon={Smartphone}
                            label="UPI / GPay"
                        />
                        <PaymentModeButton
                            mode="BANK_TRANSFER"
                            current={paymentMode}
                            set={setPaymentMode}
                            icon={Landmark}
                            label="Bank Transfer"
                        />
                        <PaymentModeButton
                            mode="CHEQUE"
                            current={paymentMode}
                            set={setPaymentMode}
                            icon={Receipt}
                            label="Cheque"
                        />
                    </div>
                </section>

                {/* Submit Action */}
                <button
                    type="submit"
                    disabled={submitting || !selectedSub || !amountPaid}
                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-medium shadow-[0_4px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_4px_25px_rgba(79,70,229,0.4)] flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    {submitting ? (
                        <Loader2 className="animate-spin" size={24} />
                    ) : (
                        <>
                            <span>Confirm Collection</span>
                            <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}

// Sub-component for Payment Buttons
function PaymentModeButton({ mode, current, set, icon: Icon, label }: any) {
    const isSelected = current === mode;
    return (
        <button
            type="button"
            onClick={() => set(mode)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${isSelected
                ? 'bg-zinc-100 text-zinc-900 border-zinc-100 shadow-lg shadow-white/5 scale-[1.02]'
                : 'bg-zinc-900 text-zinc-500 border-white/5 hover:bg-zinc-800'
                }`}
        >
            <Icon size={20} strokeWidth={isSelected ? 2 : 1.5} />
            <span className="text-xs font-medium">{label}</span>
        </button>
    );
}

// Fallback Loader
function LoadingFallback() {
    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <Loader2 className="animate-spin text-zinc-500" size={32} />
        </div>
    );
}

export default function ModernNewCollectionPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <NewCollectionForm />
        </Suspense>
    );
}