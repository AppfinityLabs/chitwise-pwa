'use client';

import { useState, useEffect } from 'react';
import { collectionsApi } from '@/lib/api';
import {
    Plus,
    Search,
    ArrowDownLeft,
    Banknote,
    CreditCard,
    Smartphone,
    Wallet,
    Calendar
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

function formatDate(dateString: string) {
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

// Helper to choose icon based on payment mode
function getPaymentIcon(mode: string) {
    const m = mode?.toUpperCase() || '';
    if (m.includes('CASH')) return <Banknote size={18} />;
    if (m.includes('UPI') || m.includes('GPAY') || m.includes('PHONEPE')) return <Smartphone size={18} />;
    if (m.includes('BANK') || m.includes('TRANSFER')) return <CreditCard size={18} />;
    return <Wallet size={18} />;
}

export default function ModernCollectionsPage() {
    const [collections, setCollections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadCollections();
    }, []);

    async function loadCollections() {
        try {
            const data = await collectionsApi.list();
            // Ensure data is sorted by date descending (newest first)
            const sorted = data.sort((a: any, b: any) =>
                new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime()
            );
            setCollections(sorted);
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

    // Grouping Logic
    const groupedByDate: Record<string, any[]> = {};
    filteredCollections.forEach((col) => {
        // Use ISO string split to ensure consistent grouping keys, but format for display later
        const dateObj = new Date(col.collectedAt);
        const dateKey = dateObj.toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric', weekday: 'short'
        });

        if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = [];
        }
        groupedByDate[dateKey].push(col);
    });

    // Calculate "Today's Inflow"
    const todayStr = new Date().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', weekday: 'short'
    });
    const totalToday = groupedByDate[todayStr]?.reduce((sum, c) => sum + c.amountPaid, 0) || 0;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-24">

            {/* 1. Header & Daily Pulse */}
            <div className="sticky top-0 z-20 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 pb-4">
                <header className="px-6 pt-6 mb-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">
                                Today's Inflow
                            </p>
                            <h1 className="text-3xl font-light text-white tracking-tight">
                                {formatCurrency(totalToday)}
                            </h1>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400">
                            <Calendar size={18} />
                        </div>
                    </div>
                </header>

                {/* Search Bar */}
                <div className="px-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="w-full bg-zinc-900/50 border border-white/5 text-sm text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:bg-zinc-900 transition-all placeholder:text-zinc-600"
                            placeholder="Search transactions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* 2. Transaction Feed */}
            <div className="px-4 mt-4 space-y-6">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex items-center gap-4 animate-pulse">
                                <div className="h-12 w-12 rounded-full bg-zinc-900" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 w-24 bg-zinc-900 rounded" />
                                    <div className="h-3 w-32 bg-zinc-900 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : Object.keys(groupedByDate).length > 0 ? (
                    Object.entries(groupedByDate).map(([date, cols]) => (
                        <div key={date} className="relative">
                            {/* Sticky Date Header */}
                            <div className="sticky top-[130px] z-10 bg-zinc-950/95 backdrop-blur-sm py-2 mb-2 flex justify-between items-center text-xs font-medium border-b border-white/5">
                                <span className="text-zinc-400">{date}</span>
                                <span className="text-zinc-600">
                                    {formatCurrency(cols.reduce((s, c) => s + c.amountPaid, 0))}
                                </span>
                            </div>

                            {/* Transactions List */}
                            <div className="space-y-1">
                                {cols.map((col) => (
                                    <div
                                        key={col._id}
                                        className="group flex items-center justify-between p-3 -mx-2 hover:bg-zinc-900/50 rounded-xl transition-colors cursor-default"
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Dynamic Icon based on Payment Mode */}
                                            <div className="h-10 w-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-colors">
                                                {getPaymentIcon(col.paymentMode)}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-zinc-200 truncate">{col.memberId?.name || 'Unknown'}</p>
                                                <p className="text-xs text-zinc-500 truncate flex items-center gap-1">
                                                    {col.groupId?.groupName} • <span className="lowercase">{col.paymentMode}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-sm font-medium text-emerald-400">
                                                +{formatCurrency(col.amountPaid)}
                                            </p>
                                            <div className="flex items-center justify-end gap-1 text-[10px] text-zinc-600">
                                                <span>Received</span>
                                                <ArrowDownLeft size={10} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="h-16 w-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-white/5">
                            <Wallet size={24} className="text-zinc-600" />
                        </div>
                        <p className="text-zinc-400 font-medium">No collections found</p>
                        <p className="text-zinc-600 text-sm mt-1">
                            Record a new collection to see it here.
                        </p>
                    </div>
                )}
            </div>

            {/* FAB */}
            <div className="fixed bottom-24 right-6 z-40">
                <Link
                    href="/collections/new"
                    className="h-14 w-14 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                >
                    <Plus size={28} />
                </Link>
            </div>
        </div>
    );
}