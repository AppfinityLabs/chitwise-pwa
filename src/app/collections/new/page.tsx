'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { subscriptionsApi, collectionsApi } from '@/lib/api';
import { ArrowLeft, Loader2, Search, Check } from 'lucide-react';
import Link from 'next/link';

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
}

function NewCollectionForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preSelectedSub = searchParams.get('subscription');

    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [search, setSearch] = useState('');

    const [selectedSub, setSelectedSub] = useState<string>(preSelectedSub || '');
    const [amountPaid, setAmountPaid] = useState('');
    const [paymentMode, setPaymentMode] = useState('CASH');
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const data = await subscriptionsApi.list();
            setSubscriptions(data);

            if (preSelectedSub) {
                const sub = data.find((s: any) => s._id === preSelectedSub);
                if (sub) {
                    const dueAmount = (sub.groupId?.contributionAmount * sub.units) / sub.collectionFactor;
                    setAmountPaid(Math.round(dueAmount).toString());
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const selectedSubscription = subscriptions.find((s) => s._id === selectedSub);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedSub) {
            setError('Please select a member subscription');
            return;
        }
        setError('');
        setSubmitting(true);

        try {
            const sub = subscriptions.find((s) => s._id === selectedSub);
            await collectionsApi.create({
                groupMemberId: selectedSub,
                basePeriodNumber: sub.groupId?.currentPeriod || 1,
                amountPaid: Number(amountPaid),
                paymentMode,
                remarks,
            });
            setSuccess(true);
            setTimeout(() => {
                router.push('/collections');
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to record collection');
        } finally {
            setSubmitting(false);
        }
    }

    const filteredSubs = subscriptions.filter((s) =>
        s.memberId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.groupId?.groupName?.toLowerCase().includes(search.toLowerCase())
    );

    if (success) {
        return (
            <div className="page flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-[var(--success)]/20 flex items-center justify-center mb-4">
                    <Check size={40} className="text-[var(--success)]" />
                </div>
                <h2 className="text-xl font-bold">Collection Recorded!</h2>
                <p className="text-[var(--text-muted)]">
                    {formatCurrency(Number(amountPaid))} from {selectedSubscription?.memberId?.name}
                </p>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header flex items-center gap-3">
                <Link href="/collections" className="p-2 -ml-2 rounded-lg">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="page-title">Record Collection</h1>
                    <p className="page-subtitle">Record a new payment</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="page-content space-y-4">
                {error && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label className="label">Select Subscription *</label>
                    <div className="relative mb-2">
                        <Search
                            size={20}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                        />
                        <input
                            type="text"
                            className="input pl-10"
                            placeholder="Search member or group..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="loader"></div>
                        </div>
                    ) : (
                        <div className="max-h-48 overflow-y-auto rounded-xl border border-[var(--border)]">
                            {filteredSubs.length > 0 ? (
                                filteredSubs.map((sub) => (
                                    <label
                                        key={sub._id}
                                        className={`flex items-center gap-3 p-3 cursor-pointer border-b border-[var(--border)] last:border-b-0 ${selectedSub === sub._id ? 'bg-[var(--primary)]/10' : ''
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="subscription"
                                            value={sub._id}
                                            checked={selectedSub === sub._id}
                                            onChange={(e) => {
                                                setSelectedSub(e.target.value);
                                                const dueAmount = (sub.groupId?.contributionAmount * sub.units) / sub.collectionFactor;
                                                setAmountPaid(Math.round(dueAmount).toString());
                                            }}
                                            className="w-4 h-4"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{sub.memberId?.name}</p>
                                            <p className="text-sm text-[var(--text-muted)] truncate">
                                                {sub.groupId?.groupName} • {sub.units} unit(s)
                                            </p>
                                        </div>
                                        {sub.overdueAmount > 0 && (
                                            <span className="badge error text-xs">
                                                {formatCurrency(sub.overdueAmount)} due
                                            </span>
                                        )}
                                    </label>
                                ))
                            ) : (
                                <p className="p-4 text-center text-[var(--text-muted)]">No subscriptions found</p>
                            )}
                        </div>
                    )}
                </div>

                <div>
                    <label className="label">Amount (₹) *</label>
                    <input
                        type="number"
                        className="input text-2xl font-bold h-14"
                        placeholder="0"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        required
                        min="1"
                    />
                    {selectedSubscription && (
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                            Expected: {formatCurrency(
                                (selectedSubscription.groupId?.contributionAmount * selectedSubscription.units) /
                                selectedSubscription.collectionFactor
                            )}
                        </p>
                    )}
                </div>

                <div>
                    <label className="label">Payment Mode *</label>
                    <div className="grid grid-cols-4 gap-2">
                        {['CASH', 'UPI', 'CHEQUE', 'BANK_TRANSFER'].map((mode) => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => setPaymentMode(mode)}
                                className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors ${paymentMode === mode
                                        ? 'bg-[var(--primary)] text-white'
                                        : 'bg-[var(--card)] text-[var(--text-muted)] border border-[var(--border)]'
                                    }`}
                            >
                                {mode === 'BANK_TRANSFER' ? 'Bank' : mode}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="label">Remarks (Optional)</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="Any notes..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={submitting || !selectedSub}
                        className="btn btn-primary w-full h-12"
                    >
                        {submitting ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            `Collect ${amountPaid ? formatCurrency(Number(amountPaid)) : ''}`
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="page">
            <div className="page-header flex items-center gap-3">
                <div className="loader"></div>
                <span className="text-[var(--text-muted)]">Loading...</span>
            </div>
        </div>
    );
}

export default function NewCollectionPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <NewCollectionForm />
        </Suspense>
    );
}
