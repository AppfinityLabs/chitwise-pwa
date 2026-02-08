'use client';

import { useState, useEffect } from 'react';
import { winnersApi, groupsApi } from '@/lib/api';
import { Trophy, Plus, Filter } from 'lucide-react';
import Link from 'next/link';

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function WinnersPage() {
    const [winners, setWinners] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGroup, setSelectedGroup] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [winnersData, groupsData] = await Promise.all([
                winnersApi.list(),
                groupsApi.list(),
            ]);
            setWinners(winnersData);
            setGroups(groupsData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const filteredWinners = selectedGroup
        ? winners.filter((w) => w.groupId?._id === selectedGroup)
        : winners;

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">Winners</h1>
                <p className="page-subtitle">{winners.length} total draws</p>
            </div>

            <div className="page-content">
                {/* Filter */}
                <div className="flex items-center gap-2 mb-4">
                    <Filter size={18} className="text-[var(--text-muted)]" />
                    <select
                        className="select flex-1"
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                    >
                        <option value="">All Groups</option>
                        {groups.map((g) => (
                            <option key={g._id} value={g._id}>{g.groupName}</option>
                        ))}
                    </select>
                </div>

                {/* Winners List */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="card h-20 animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredWinners.length > 0 ? (
                    <div className="rounded-xl overflow-hidden">
                        {filteredWinners.map((winner) => (
                            <div key={winner._id} className="list-item">
                                <div className="w-10 h-10 rounded-full bg-[var(--warning)]/20 flex items-center justify-center flex-shrink-0">
                                    <Trophy size={20} className="text-[var(--warning)]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{winner.memberId?.name || 'Unknown'}</p>
                                    <p className="text-sm text-[var(--text-muted)]">
                                        {winner.groupId?.groupName} • Period {winner.basePeriodNumber}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-[var(--success)]">
                                        {formatCurrency(winner.prizeAmount)}
                                    </p>
                                    <span className={`badge ${winner.status === 'PAID' ? 'success' : 'warning'} text-xs`}>
                                        {winner.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <Trophy size={48} className="mb-4" />
                        <p>No winners recorded</p>
                        <Link href="/winners/new" className="btn btn-primary mt-4">
                            Record First Winner
                        </Link>
                    </div>
                )}
            </div>

            {/* FAB */}
            <Link href="/winners/new" className="fab">
                <Plus size={24} />
            </Link>
        </div>
    );
}
