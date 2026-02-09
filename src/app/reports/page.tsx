'use client';

import { useRouter } from 'next/navigation';
import { useReports } from '@/lib/swr';
import {
    ArrowLeft,
    BarChart3,
    PieChart,
    TrendingUp,
    Wallet,
    Smartphone,
    Banknote,
    CreditCard,
    Landmark,
    LayoutGrid,
    Trophy
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

// Reuse icon logic for consistency
function getPaymentIcon(mode: string) {
    const m = mode?.toUpperCase() || '';
    if (m.includes('CASH')) return <Banknote size={18} />;
    if (m.includes('UPI') || m.includes('GPAY')) return <Smartphone size={18} />;
    if (m.includes('BANK')) return <Landmark size={18} />;
    return <CreditCard size={18} />;
}

export default function ModernReportsPage() {
    const router = useRouter();
    // SWR hook - instantly shows cached data, revalidates in background
    const { data, isLoading: loading } = useReports();

    const totalCollections = data?.trends?.reduce((sum: number, t: any) => sum + t.amount, 0) || 0;

    // Calculate max value for scaling bars
    const maxTrendValue = data?.trends?.length
        ? Math.max(...data.trends.map((t: any) => t.amount))
        : 0;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-24">

            {/* Header */}
            <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/5 text-zinc-400 transition-colors">
                    <ArrowLeft size={22} />
                </button>
                <div>
                    <h1 className="text-lg font-medium text-white">Analytics</h1>
                    <p className="text-xs text-zinc-500">Financial Insights</p>
                </div>
            </header>

            <main className="p-4 space-y-8">
                {loading ? (
                    <div className="space-y-6">
                        <div className="h-32 bg-zinc-900 rounded-3xl animate-pulse" />
                        <div className="h-64 bg-zinc-900 rounded-3xl animate-pulse" />
                        <div className="h-48 bg-zinc-900 rounded-3xl animate-pulse" />
                    </div>
                ) : (
                    <>
                        {/* 1. Hero KPI Card */}
                        <section className="relative overflow-hidden rounded-[2rem] bg-zinc-900 border border-white/10 p-6 shadow-2xl">
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                    <TrendingUp size={16} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Total Volume</span>
                                </div>
                                <h2 className="text-4xl font-light tracking-tight text-white mb-1">
                                    {formatCurrency(totalCollections)}
                                </h2>
                                <p className="text-xs text-zinc-500">Aggregate collections (Last 6 Months)</p>
                            </div>
                        </section>

                        {/* 2. Monthly Trends (Bar Chart) */}
                        <section>
                            <div className="flex items-center gap-2 mb-4 px-1">
                                <BarChart3 size={16} className="text-indigo-400" />
                                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Monthly Trends</h3>
                            </div>

                            <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-5 space-y-5">
                                {data?.trends && data.trends.length > 0 ? (
                                    data.trends.map((trend: any, idx: number) => {
                                        const percentage = maxTrendValue ? (trend.amount / maxTrendValue) * 100 : 0;
                                        return (
                                            <div key={idx} className="group">
                                                <div className="flex justify-between text-xs mb-2">
                                                    <span className="font-medium text-zinc-400 group-hover:text-white transition-colors">
                                                        {trend.name}
                                                    </span>
                                                    <span className="font-bold text-zinc-200">
                                                        {formatCurrency(trend.amount)}
                                                    </span>
                                                </div>
                                                {/* The Bar */}
                                                <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000 group-hover:brightness-110"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <EmptyData />
                                )}
                            </div>
                        </section>

                        {/* 3. Payment Methods (Grid) */}
                        <section>
                            <div className="flex items-center gap-2 mb-4 px-1">
                                <PieChart size={16} className="text-indigo-400" />
                                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Incoming Channels</h3>
                            </div>

                            <div className="grid gap-3">
                                {data?.paymentModeStats && data.paymentModeStats.length > 0 ? (
                                    data.paymentModeStats.map((stat: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900 border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 border border-white/5">
                                                    {getPaymentIcon(stat.name)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-zinc-200 uppercase tracking-wide">
                                                        {stat.name || 'Unknown'}
                                                    </p>
                                                    {/* Count is not available in API response */}
                                                    {/* <p className="text-[10px] text-zinc-500">{stat.count} transactions</p> */}
                                                </div>
                                            </div>
                                            <p className="font-medium text-emerald-400">{formatCurrency(stat.value)}</p>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyData />
                                )}
                            </div>
                        </section>

                        {/* 4. Top Groups (Ranked List) */}
                        <section>
                            <div className="flex items-center gap-2 mb-4 px-1">
                                <Trophy size={16} className="text-amber-400" />
                                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Top Performing Groups</h3>
                            </div>

                            <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden divide-y divide-white/5">
                                {data?.groupPerformance && data.groupPerformance.length > 0 ? (
                                    data.groupPerformance.slice(0, 5).map((gp: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                {/* Rank Badge */}
                                                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-amber-400 text-black' :
                                                    idx === 1 ? 'bg-zinc-400 text-black' :
                                                        idx === 2 ? 'bg-orange-400 text-black' :
                                                            'bg-zinc-800 text-zinc-500'
                                                    }`}>
                                                    {idx + 1}
                                                </div>
                                                <span className="text-sm font-medium text-zinc-300 truncate max-w-[140px]">
                                                    {gp.name || 'Unknown'}
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium text-white">
                                                {formatCurrency(gp.value)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyData />
                                )}
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}

function EmptyData() {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-10 w-10 bg-zinc-800 rounded-full flex items-center justify-center mb-2">
                <BarChart3 size={16} className="text-zinc-600" />
            </div>
            <p className="text-xs text-zinc-500">No data available for this period.</p>
        </div>
    );
}