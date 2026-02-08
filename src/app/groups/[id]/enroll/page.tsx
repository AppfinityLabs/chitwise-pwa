'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { groupsApi, membersApi, subscriptionsApi } from '@/lib/api';
import { ArrowLeft, Loader2, Search } from 'lucide-react';
import Link from 'next/link';

export default function EnrollMemberPage() {
    const params = useParams();
    const router = useRouter();
    const groupId = params.id as string;

    const [group, setGroup] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    const [selectedMember, setSelectedMember] = useState<string>('');
    const [units, setUnits] = useState('1');
    const [collectionPattern, setCollectionPattern] = useState('MONTHLY');

    useEffect(() => {
        loadData();
    }, [groupId]);

    async function loadData() {
        try {
            const [groupData, membersData] = await Promise.all([
                groupsApi.get(groupId),
                membersApi.list(),
            ]);
            setGroup(groupData);
            setMembers(membersData);
            setCollectionPattern(groupData.frequency);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedMember) {
            setError('Please select a member');
            return;
        }
        setError('');
        setSubmitting(true);

        try {
            await subscriptionsApi.create({
                groupId,
                memberId: selectedMember,
                units: Number(units),
                collectionPattern,
            });
            router.push(`/groups/${groupId}`);
        } catch (err: any) {
            setError(err.message || 'Failed to enroll member');
        } finally {
            setSubmitting(false);
        }
    }

    const filteredMembers = members.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="page">
                <div className="page-header flex items-center gap-3">
                    <div className="loader"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header flex items-center gap-3">
                <Link href={`/groups/${groupId}`} className="p-2 -ml-2 rounded-lg">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="page-title">Enroll Member</h1>
                    <p className="page-subtitle">{group?.groupName}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="page-content space-y-4">
                {error && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Member Search */}
                <div>
                    <label className="label">Select Member *</label>
                    <div className="relative mb-2">
                        <Search
                            size={20}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                        />
                        <input
                            type="text"
                            className="input pl-10"
                            placeholder="Search members..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="max-h-48 overflow-y-auto rounded-xl border border-[var(--border)]">
                        {filteredMembers.length > 0 ? (
                            filteredMembers.map((member) => (
                                <label
                                    key={member._id}
                                    className={`flex items-center gap-3 p-3 cursor-pointer border-b border-[var(--border)] last:border-b-0 ${selectedMember === member._id ? 'bg-[var(--primary)]/10' : ''
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="member"
                                        value={member._id}
                                        checked={selectedMember === member._id}
                                        onChange={(e) => setSelectedMember(e.target.value)}
                                        className="w-4 h-4"
                                    />
                                    <div>
                                        <p className="font-medium">{member.name}</p>
                                        <p className="text-sm text-[var(--text-muted)]">{member.phone}</p>
                                    </div>
                                </label>
                            ))
                        ) : (
                            <p className="p-4 text-center text-[var(--text-muted)]">No members found</p>
                        )}
                    </div>
                </div>

                {/* Units */}
                <div>
                    <label className="label">Units *</label>
                    <select
                        className="select"
                        value={units}
                        onChange={(e) => setUnits(e.target.value)}
                    >
                        <option value="0.5">0.5 (Half)</option>
                        <option value="1">1 (Full)</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </select>
                </div>

                {/* Collection Pattern */}
                <div>
                    <label className="label">Collection Pattern *</label>
                    <select
                        className="select"
                        value={collectionPattern}
                        onChange={(e) => setCollectionPattern(e.target.value)}
                    >
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                    </select>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                        How this member prefers to make payments
                    </p>
                </div>

                {/* Summary */}
                {selectedMember && group && (
                    <div className="card bg-[var(--primary)]/10 border-[var(--primary)]/20">
                        <p className="text-sm text-[var(--text-muted)] mb-2">Summary</p>
                        <p className="font-medium">
                            Total Due: ₹{(group.contributionAmount * Number(units) * group.totalPeriods).toLocaleString('en-IN')}
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">
                            Per {collectionPattern.toLowerCase()}: ₹
                            {(
                                (group.contributionAmount * Number(units)) /
                                (collectionPattern === 'DAILY' ? 30 : collectionPattern === 'WEEKLY' ? 4 : 1)
                            ).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </p>
                    </div>
                )}

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn btn-primary w-full h-12"
                    >
                        {submitting ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            'Enroll Member'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
