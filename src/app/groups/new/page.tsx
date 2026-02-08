'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { groupsApi } from '@/lib/api';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewGroupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        groupName: '',
        frequency: 'MONTHLY',
        contributionAmount: '',
        totalUnits: '',
        totalPeriods: '',
        commissionValue: '',
        startDate: new Date().toISOString().split('T')[0],
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
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
        } finally {
            setLoading(false);
        }
    }

    const potValue = Number(form.contributionAmount) * Number(form.totalUnits);

    return (
        <div className="page">
            <div className="page-header flex items-center gap-3">
                <Link href="/groups" className="p-2 -ml-2 rounded-lg hover:bg-[var(--card)]">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="page-title">New Group</h1>
                    <p className="page-subtitle">Create a new chit group</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="page-content space-y-4">
                {error && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label className="label">Group Name *</label>
                    <input
                        type="text"
                        name="groupName"
                        className="input"
                        placeholder="e.g., Sunshine 1 Lakh"
                        value={form.groupName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label className="label">Frequency *</label>
                    <select
                        name="frequency"
                        className="select"
                        value={form.frequency}
                        onChange={handleChange}
                        required
                    >
                        <option value="MONTHLY">Monthly</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="DAILY">Daily</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Contribution (₹) *</label>
                        <input
                            type="number"
                            name="contributionAmount"
                            className="input"
                            placeholder="5000"
                            value={form.contributionAmount}
                            onChange={handleChange}
                            required
                            min="1"
                        />
                    </div>
                    <div>
                        <label className="label">Total Units *</label>
                        <input
                            type="number"
                            name="totalUnits"
                            className="input"
                            placeholder="20"
                            value={form.totalUnits}
                            onChange={handleChange}
                            required
                            min="1"
                        />
                    </div>
                </div>

                {potValue > 0 && (
                    <div className="card bg-[var(--primary)]/10 border-[var(--primary)]/20">
                        <p className="text-sm text-[var(--text-muted)]">Pot Value</p>
                        <p className="text-xl font-bold text-[var(--primary)]">
                            ₹{potValue.toLocaleString('en-IN')}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Total Periods *</label>
                        <input
                            type="number"
                            name="totalPeriods"
                            className="input"
                            placeholder="20"
                            value={form.totalPeriods}
                            onChange={handleChange}
                            required
                            min="1"
                        />
                    </div>
                    <div>
                        <label className="label">Commission (₹) *</label>
                        <input
                            type="number"
                            name="commissionValue"
                            className="input"
                            placeholder="5000"
                            value={form.commissionValue}
                            onChange={handleChange}
                            required
                            min="0"
                        />
                    </div>
                </div>

                <div>
                    <label className="label">Start Date *</label>
                    <input
                        type="date"
                        name="startDate"
                        className="input"
                        value={form.startDate}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full h-12"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            'Create Group'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
