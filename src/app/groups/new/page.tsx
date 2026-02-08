'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { groupsApi } from '@/lib/api';
import {
    ArrowLeft,
    Loader2,
    Sparkles,
    CalendarClock,
    Users,
    IndianRupee,
    CalendarDays,
    Percent,
    Layers
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

export default function ModernNewGroupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [form, setForm] = useState({
        groupName: '',
        frequency: 'MONTHLY',
        contributionAmount: '',
        totalUnits: '',
        totalPeriods: '',
        commissionValue: '',
        startDate: new Date().toISOString().split('T')[0],
    });

    // Derived State for Live Preview
    const potValue = (Number(form.contributionAmount) || 0) * (Number(form.totalUnits) || 0);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    // Custom handler for frequency toggle
    function setFrequency(freq: string) {
        setForm(prev => ({ ...prev, frequency: freq }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await groupsApi.create({
                ...form,
                contributionAmount: Number(form.contributionAmount),
                totalUnits: Number(form.totalUnits),
                totalPeriods: Number(form.totalPeriods),
                commissionValue: Number(form.commissionValue),
            });
            router.push('/groups');
        } catch (err: any) {
            setError(err.message || 'Failed to create group');
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-24">

            {/* Header */}
            <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center gap-4">
                <Link href="/groups" className="p-2 -ml-2 rounded-full hover:bg-white/5 text-zinc-400 transition-colors">
                    <ArrowLeft size={22} />
                </Link>
                <h1 className="text-lg font-medium text-white">Create Asset</h1>
            </header>

            <main className="p-4 max-w-lg mx-auto space-y-8">

                {/* 1. Live Preview Card (The "Minting" Visual) */}
                <section className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-white/10 p-6 shadow-2xl transition-all duration-500">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center text-center space-y-1">
                        <div className="flex items-center gap-2 text-emerald-400 mb-2">
                            <Sparkles size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Projected Value</span>
                        </div>
                        <h2 className={`text-4xl font-light tracking-tight transition-colors duration-300 ${potValue > 0 ? 'text-white' : 'text-zinc-600'}`}>
                            {formatCurrency(potValue)}
                        </h2>
                        <p className="text-xs text-zinc-500 mt-2">
                            {form.totalUnits || 0} Members × {formatCurrency(Number(form.contributionAmount) || 0)}
                        </p>
                    </div>
                </section>

                {/* Error Message */}
                {error && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 animate-in slide-in-from-top-2">
                        <div className="h-2 w-2 rounded-full bg-rose-500" />
                        <p className="text-rose-200 text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* 2. Identity Section */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-zinc-400 pl-1">Identity</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                                    <Layers size={18} />
                                </div>
                                <input
                                    type="text"
                                    name="groupName"
                                    placeholder="Group Name (e.g. Gold Circle 2026)"
                                    className="w-full bg-zinc-900 border border-white/5 text-white rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600"
                                    value={form.groupName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Frequency Toggle */}
                        <div className="p-1 bg-zinc-900 rounded-xl flex items-center border border-white/5">
                            {['DAILY', 'WEEKLY', 'MONTHLY'].map((freq) => (
                                <button
                                    key={freq}
                                    type="button"
                                    onClick={() => setFrequency(freq)}
                                    className={`flex-1 py-2.5 text-xs font-bold tracking-wide rounded-lg transition-all ${form.frequency === freq
                                        ? 'bg-zinc-800 text-white shadow-sm'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                        }`}
                                >
                                    {freq}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. Financial Mechanics */}
                    <div className="space-y-4">
                        <label className="text-sm font-medium text-zinc-400 pl-1">Mechanics</label>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Contribution */}
                            <div className="space-y-1.5">
                                <span className="text-xs text-zinc-500 ml-1">Contribution</span>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
                                        <IndianRupee size={16} />
                                    </div>
                                    <input
                                        type="number"
                                        name="contributionAmount"
                                        placeholder="5000"
                                        className="w-full bg-zinc-900 border border-white/5 text-white rounded-xl py-3 pl-10 pr-3 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                        value={form.contributionAmount}
                                        onChange={handleChange}
                                        required
                                        min="1"
                                    />
                                </div>
                            </div>

                            {/* Total Units */}
                            <div className="space-y-1.5">
                                <span className="text-xs text-zinc-500 ml-1">Total Units</span>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                                        <Users size={16} />
                                    </div>
                                    <input
                                        type="number"
                                        name="totalUnits"
                                        placeholder="20"
                                        className="w-full bg-zinc-900 border border-white/5 text-white rounded-xl py-3 pl-10 pr-3 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                        value={form.totalUnits}
                                        onChange={handleChange}
                                        required
                                        min="1"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Timeline & Admin */}
                    <div className="space-y-4">
                        <label className="text-sm font-medium text-zinc-400 pl-1">Timeline & Admin</label>
                        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 space-y-4">

                            <div className="flex gap-4">
                                <div className="flex-1 space-y-1.5">
                                    <span className="text-xs text-zinc-500">Duration (Periods)</span>
                                    <div className="relative">
                                        <CalendarClock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                        <input
                                            type="number"
                                            name="totalPeriods"
                                            placeholder="20"
                                            className="w-full bg-zinc-950 border border-white/5 text-white rounded-lg py-2.5 pl-9 pr-3 focus:outline-none focus:border-indigo-500/50 text-sm"
                                            value={form.totalPeriods}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 space-y-1.5">
                                    <span className="text-xs text-zinc-500">Commission</span>
                                    <div className="relative">
                                        <Percent size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                        <input
                                            type="number"
                                            name="commissionValue"
                                            placeholder="5000"
                                            className="w-full bg-zinc-950 border border-white/5 text-white rounded-lg py-2.5 pl-9 pr-3 focus:outline-none focus:border-indigo-500/50 text-sm"
                                            value={form.commissionValue}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5 pt-2 border-t border-white/5">
                                <span className="text-xs text-zinc-500">Start Date</span>
                                <div className="relative">
                                    <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    {/* Custom styling for date input to look decent in dark mode */}
                                    <input
                                        type="date"
                                        name="startDate"
                                        className="w-full bg-zinc-950 border border-white/5 text-white rounded-lg py-2.5 pl-9 pr-3 focus:outline-none focus:border-indigo-500/50 text-sm [color-scheme:dark]"
                                        value={form.startDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-medium shadow-[0_4px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_4px_25px_rgba(79,70,229,0.4)] flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <span className="text-lg">Create Asset</span>
                            )}
                        </button>
                    </div>

                </form>
            </main>
        </div>
    );
}