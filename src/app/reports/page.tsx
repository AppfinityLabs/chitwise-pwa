'use client';

import { useState, useEffect } from 'react';
import { reportsApi } from '@/lib/api';
import { ArrowLeft, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import Link from 'next/link';

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function ReportsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReports();
    }, []);

    async function loadReports() {
        try {
            const result = await reportsApi.get();
            setData(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const totalCollections = data?.trends?.reduce((sum: number, t: any) => sum + t.total, 0) || 0;

    return (
        <div className="page">
            <div className="page-header flex items-center gap-3">
                <Link href="/more" className="p-2 -ml-2 rounded-lg">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="page-title">Reports</h1>
                    <p className="page-subtitle">Analytics & insights</p>
                </div>
            </div>

            <div className="page-content space-y-4">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="card h-32 animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Total Collections */}
                        <div className="stat-card">
                            <TrendingUp size={24} className="mb-2 opacity-80" />
                            <p className="text-3xl font-bold">{formatCurrency(totalCollections)}</p>
                            <p className="opacity-80">Total Collections (Last 6 months)</p>
                        </div>

                        {/* Collection Trends */}
                        <div className="card">
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart3 size={20} className="text-[var(--primary)]" />
                                <h3 className="font-semibold">Collection Trends</h3>
                            </div>
                            {data?.trends && data.trends.length > 0 ? (
                                <div className="space-y-3">
                                    {data.trends.map((trend: any, idx: number) => {
                                        const maxAmount = Math.max(...data.trends.map((t: any) => t.total));
                                        const percentage = (trend.total / maxAmount) * 100;
                                        return (
                                            <div key={idx}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-[var(--text-muted)]">{trend._id}</span>
                                                    <span className="font-medium">{formatCurrency(trend.total)}</span>
                                                </div>
                                                <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[var(--primary)] rounded-full transition-all"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-center text-[var(--text-muted)] py-4">No data available</p>
                            )}
                        </div>

                        {/* Payment Mode Stats */}
                        <div className="card">
                            <div className="flex items-center gap-2 mb-4">
                                <PieChart size={20} className="text-[var(--primary)]" />
                                <h3 className="font-semibold">Payment Modes</h3>
                            </div>
                            {data?.paymentModeStats && data.paymentModeStats.length > 0 ? (
                                <div className="space-y-2">
                                    {data.paymentModeStats.map((stat: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center py-2 border-b border-[var(--border)] last:border-0">
                                            <span>{stat._id || 'Unknown'}</span>
                                            <div className="text-right">
                                                <p className="font-medium">{formatCurrency(stat.total)}</p>
                                                <p className="text-xs text-[var(--text-muted)]">{stat.count} transactions</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-[var(--text-muted)] py-4">No data available</p>
                            )}
                        </div>

                        {/* Group Performance */}
                        <div className="card">
                            <h3 className="font-semibold mb-4">Group Performance</h3>
                            {data?.groupPerformance && data.groupPerformance.length > 0 ? (
                                <div className="space-y-3">
                                    {data.groupPerformance.slice(0, 5).map((gp: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center">
                                            <span className="truncate flex-1">{gp._id?.groupName || 'Unknown'}</span>
                                            <span className="font-medium text-[var(--success)]">
                                                {formatCurrency(gp.totalCollected)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-[var(--text-muted)] py-4">No data available</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
