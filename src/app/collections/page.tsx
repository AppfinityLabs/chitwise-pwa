'use client';

import { useState, useEffect } from 'react';
import { collectionsApi } from '@/lib/api';
import { Plus, Wallet, Calendar, Search } from 'lucide-react';
import Link from 'next/link';

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default function CollectionsPage() {
    const [collections, setCollections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadCollections();
    }, []);

    async function loadCollections() {
        try {
            const data = await collectionsApi.list();
            setCollections(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const filteredCollections = collections.filter((c) =>
        c.memberId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.groupId?.groupName?.toLowerCase().includes(search.toLowerCase())
    );

    // Group by date
    const groupedByDate: Record<string, any[]> = {};
    filteredCollections.forEach((col) => {
        const dateKey = formatDate(col.collectedAt);
        if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = [];
        }
        groupedByDate[dateKey].push(col);
    });

    const totalToday = filteredCollections
        .filter((c) => formatDate(c.collectedAt) === formatDate(new Date().toISOString()))
        .reduce((sum, c) => sum + c.amountPaid, 0);

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">Collections</h1>
                <p className="page-subtitle">Today: {formatCurrency(totalToday)}</p>
            </div>

            <div className="page-content">
                {/* Search */}
                <div className="relative mb-4">
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

                {/* Collections List */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="card h-16 animate-pulse"></div>
                        ))}
                    </div>
                ) : Object.keys(groupedByDate).length > 0 ? (
                    <div className="space-y-4">
                        {Object.entries(groupedByDate).map(([date, cols]) => (
                            <div key={date}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar size={14} className="text-[var(--text-muted)]" />
                                    <span className="text-sm font-medium text-[var(--text-muted)]">{date}</span>
                                    <span className="text-xs text-[var(--primary)]">
                                        ({formatCurrency(cols.reduce((s, c) => s + c.amountPaid, 0))})
                                    </span>
                                </div>
                                <div className="rounded-xl overflow-hidden">
                                    {cols.map((col) => (
                                        <div key={col._id} className="list-item">
                                            <div className="w-10 h-10 rounded-xl bg-[var(--success)]/20 flex items-center justify-center flex-shrink-0">
                                                <Wallet size={20} className="text-[var(--success)]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{col.memberId?.name || 'Unknown'}</p>
                                                <p className="text-sm text-[var(--text-muted)] truncate">
                                                    {col.groupId?.groupName || 'Unknown Group'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-[var(--success)]">
                                                    {formatCurrency(col.amountPaid)}
                                                </p>
                                                <p className="text-xs text-[var(--text-muted)]">{col.paymentMode}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <Wallet size={48} className="mb-4" />
                        <p>No collections yet</p>
                        <Link href="/collections/new" className="btn btn-primary mt-4">
                            Record First Collection
                        </Link>
                    </div>
                )}
            </div>

            {/* FAB */}
            <Link href="/collections/new" className="fab">
                <Plus size={24} />
            </Link>
        </div>
    );
}
