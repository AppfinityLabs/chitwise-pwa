'use client';

import { useState, useEffect } from 'react';
import { groupsApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Plus, Search, ChevronRight, Grid3X3, Users, Calendar } from 'lucide-react';
import Link from 'next/link';

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function GroupsPage() {
    const router = useRouter();
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadGroups();
    }, []);

    async function loadGroups() {
        try {
            const data = await groupsApi.list();
            setGroups(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const filteredGroups = groups.filter((g) =>
        g.groupName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">Chit Groups</h1>
                <p className="page-subtitle">{groups.length} total groups</p>
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
                        placeholder="Search groups..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Groups List */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="card h-24 animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredGroups.length > 0 ? (
                    <div className="rounded-xl overflow-hidden">
                        {filteredGroups.map((group) => (
                            <Link
                                key={group._id}
                                href={`/groups/${group._id}`}
                                className="list-item"
                            >
                                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0">
                                    <Grid3X3 size={20} className="text-[var(--primary)]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{group.groupName}</p>
                                    <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                                        <span>{formatCurrency(group.contributionAmount)}/{group.frequency.toLowerCase()}</span>
                                        <span className="flex items-center gap-1">
                                            <Users size={14} />
                                            {group.totalUnits}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`badge ${group.status === 'ACTIVE' ? 'success' : 'warning'}`}>
                                        {group.status}
                                    </span>
                                    <p className="text-xs text-[var(--text-muted)] mt-1">
                                        Period {group.currentPeriod}/{group.totalPeriods}
                                    </p>
                                </div>
                                <ChevronRight size={20} className="text-[var(--text-muted)] flex-shrink-0" />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <Grid3X3 size={48} className="mb-4" />
                        <p>No groups found</p>
                        <Link href="/groups/new" className="btn btn-primary mt-4">
                            Create First Group
                        </Link>
                    </div>
                )}
            </div>

            {/* FAB */}
            <Link href="/groups/new" className="fab">
                <Plus size={24} />
            </Link>
        </div>
    );
}
