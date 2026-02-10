'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Trophy, Calendar, User, Coins, FileText,
    CheckCircle2, Loader2, Trash2, Crown, Clock, XCircle
} from 'lucide-react';
import { useWinner, invalidateAfterWinnerCreate } from '@/lib/swr';
import { winnersApi } from '@/lib/api';

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR',
        minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount);
}

export default function WinnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { data: winner, isLoading, mutate } = useWinner(id);
    const [loading, setLoading] = useState(false);

    const handleMarkPaid = async () => {
        if (!confirm('Mark this winner as PAID?')) return;
        setLoading(true);
        try {
            await winnersApi.update(id, { status: 'PAID', payoutDate: new Date() });
            await mutate();
            await invalidateAfterWinnerCreate(winner?.groupId?._id);
        } catch (err: any) {
            alert(err.message || 'Failed to update');
        } finally {
            setLoading(false);
        }
    };

    const handleForfeit = async () => {
        if (!confirm('Mark as FORFEITED?')) return;
        setLoading(true);
        try {
            await winnersApi.update(id, { status: 'FORFEITED' });
            await mutate();
            await invalidateAfterWinnerCreate(winner?.groupId?._id);
        } catch (err: any) {
            alert(err.message || 'Failed to update');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this winner record?')) return;
        setLoading(true);
        try {
            await winnersApi.delete(id);
            await invalidateAfterWinnerCreate(winner?.groupId?._id);
            router.push('/winners');
        } catch (err: any) {
            alert(err.message || 'Failed to delete');
            setLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
                <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center gap-4">
                    <div className="h-5 w-32 bg-zinc-800 rounded animate-pulse" />
                </header>
                <div className="p-4 space-y-4">
                    {[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-zinc-900 rounded-2xl animate-pulse" />)}
                </div>
            </div>
        );
    }

    if (!winner) {
        return (
            <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center">
                <Trophy size={40} className="text-zinc-700 mb-4" />
                <p className="text-zinc-400 font-medium">Winner not found</p>
                <Link href="/winners" className="text-indigo-400 text-sm mt-2">← Back to Winners</Link>
            </div>
        );
    }

    const statusConfig = {
        PAID: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        FORFEITED: { icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
        PENDING: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    };
    const sc = statusConfig[winner.status as keyof typeof statusConfig] || statusConfig.PENDING;
    const StatusIcon = sc.icon;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/5 text-zinc-400 transition-colors">
                    <ArrowLeft size={22} />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-medium text-white">Winner Detail</h1>
                    <p className="text-xs text-zinc-500">{winner.groupId?.groupName}</p>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${sc.bg} ${sc.color} ${sc.border} border`}>
                    <StatusIcon size={14} />
                    {winner.status}
                </div>
            </header>

            <div className="p-4 space-y-6">
                {/* Prize Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 p-6">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Trophy size={64} className="text-amber-500" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <Crown size={24} className="text-amber-400" />
                        </div>
                        <div>
                            <p className="font-medium text-white text-lg">{winner.memberId?.name}</p>
                            <p className="text-xs text-zinc-500">Period #{winner.basePeriodNumber}</p>
                        </div>
                    </div>
                    <p className="text-amber-500/80 text-xs font-bold uppercase tracking-widest mb-1">Prize Amount</p>
                    <h2 className="text-3xl font-medium text-amber-400">{formatCurrency(winner.prizeAmount)}</h2>
                </div>

                {/* Details */}
                <div className="space-y-1">
                    <DetailRow icon={<Coins size={16} />} label="Group" value={winner.groupId?.groupName || '—'} />
                    <DetailRow icon={<User size={16} />} label="Member" value={winner.memberId?.name || '—'} />
                    <DetailRow icon={<Trophy size={16} />} label="Method" value={
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${winner.selectionMethod === 'AUCTION'
                            ? 'bg-violet-500/10 text-violet-400' : 'bg-blue-500/10 text-blue-400'}`}>
                            {winner.selectionMethod}
                        </span>
                    } />
                    <DetailRow icon={<Coins size={16} />} label="Winning Units" value={String(winner.winningUnits)} />
                    <DetailRow icon={<Coins size={16} />} label="Commission" value={formatCurrency(winner.commissionEarned)} />
                    <DetailRow icon={<Calendar size={16} />} label="Payout Date" value={winner.payoutDate ? new Date(winner.payoutDate).toLocaleDateString() : 'Not paid yet'} />
                    <DetailRow icon={<Calendar size={16} />} label="Declared" value={new Date(winner.createdAt).toLocaleDateString()} />
                    {winner.remarks && <DetailRow icon={<FileText size={16} />} label="Remarks" value={winner.remarks} />}
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-2">
                    {winner.status === 'PENDING' && (
                        <button
                            onClick={handleMarkPaid}
                            disabled={loading}
                            className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                            Mark as Paid
                        </button>
                    )}
                    {winner.status === 'PENDING' && (
                        <button
                            onClick={handleForfeit}
                            disabled={loading}
                            className="w-full h-12 bg-zinc-900 border border-rose-500/20 text-rose-400 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            <XCircle size={18} />
                            Forfeit
                        </button>
                    )}
                    {winner.status !== 'PAID' && (
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="w-full h-12 bg-zinc-900 border border-white/5 text-zinc-500 hover:text-rose-400 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                            Delete Winner
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between py-3 px-4 bg-zinc-900/50 rounded-xl border border-white/5">
            <div className="flex items-center gap-3 text-zinc-500">
                {icon}
                <span className="text-sm">{label}</span>
            </div>
            <div className="text-sm font-medium text-white">{value}</div>
        </div>
    );
}
