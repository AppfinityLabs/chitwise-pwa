'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { groupsApi, subscriptionsApi, winnersApi } from '@/lib/api';
import { ArrowLeft, Users, Calendar, Wallet, Trophy, Plus, ChevronRight } from 'lucide-react';
import Link from 'next/link';

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function GroupDetailPage() {
    const params = useParams();
    const router = useRouter();
    const groupId = params.id as string;

    const [group, setGroup] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [winners, setWinners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'members' | 'winners'>('members');

    useEffect(() => {
        loadData();
    }, [groupId]);

    async function loadData() {
        try {
            const [groupData, membersData, winnersData] = await Promise.all([
                groupsApi.get(groupId),
                subscriptionsApi.list({ groupId }),
                winnersApi.list({ groupId }),
            ]);
            setGroup(groupData);
            setMembers(membersData);
            setWinners(winnersData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="page">
                <div className="page-header flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--card)] rounded-lg animate-pulse"></div>
                    <div className="flex-1">
                        <div className="h-6 w-40 bg-[var(--card)] rounded animate-pulse"></div>
                        <div className="h-4 w-24 bg-[var(--card)] rounded animate-pulse mt-1"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="page">
                <div className="page-header flex items-center gap-3">
                    <Link href="/groups" className="p-2 -ml-2">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="page-title">Group Not Found</h1>
                </div>
            </div>
        );
    }

    const potValue = group.contributionAmount * group.totalUnits;

    return (
        <div className="page">
            {/* Header */}
            <div className="page-header flex items-center gap-3">
                <Link href="/groups" className="p-2 -ml-2 rounded-lg">
                    <ArrowLeft size={24} />
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="page-title truncate">{group.groupName}</h1>
                    <p className="page-subtitle">
                        Period {group.currentPeriod} of {group.totalPeriods}
                    </p>
                </div>
                <span className={`badge ${group.status === 'ACTIVE' ? 'success' : 'warning'}`}>
                    {group.status}
                </span>
            </div>

            <div className="page-content space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="card">
                        <Wallet size={20} className="text-[var(--primary)] mb-1" />
                        <p className="text-lg font-bold">{formatCurrency(potValue)}</p>
                        <p className="text-xs text-[var(--text-muted)]">Pot Value</p>
                    </div>
                    <div className="card">
                        <Users size={20} className="text-[var(--primary)] mb-1" />
                        <p className="text-lg font-bold">{members.length}/{group.totalUnits}</p>
                        <p className="text-xs text-[var(--text-muted)]">Members</p>
                    </div>
                    <div className="card">
                        <Calendar size={20} className="text-[var(--primary)] mb-1" />
                        <p className="text-lg font-bold">{group.frequency}</p>
                        <p className="text-xs text-[var(--text-muted)]">{formatCurrency(group.contributionAmount)}/period</p>
                    </div>
                    <div className="card">
                        <Trophy size={20} className="text-[var(--warning)] mb-1" />
                        <p className="text-lg font-bold">{winners.length}</p>
                        <p className="text-xs text-[var(--text-muted)]">Draws Done</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-[var(--border)] -mx-4 px-4">
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`pb-3 px-1 font-medium transition-colors ${activeTab === 'members'
                                ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                                : 'text-[var(--text-muted)]'
                            }`}
                    >
                        Members ({members.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('winners')}
                        className={`pb-3 px-1 font-medium transition-colors ${activeTab === 'winners'
                                ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                                : 'text-[var(--text-muted)]'
                            }`}
                    >
                        Winners ({winners.length})
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'members' && (
                    <div>
                        {members.length > 0 ? (
                            <div className="rounded-xl overflow-hidden">
                                {members.map((sub) => (
                                    <Link
                                        key={sub._id}
                                        href={`/collections/new?subscription=${sub._id}`}
                                        className="list-item"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{sub.memberId?.name || 'Unknown'}</p>
                                            <p className="text-sm text-[var(--text-muted)]">
                                                {sub.units} unit(s) • {sub.collectionPattern}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            {sub.overdueAmount > 0 && (
                                                <span className="badge error text-xs">
                                                    {formatCurrency(sub.overdueAmount)} due
                                                </span>
                                            )}
                                            {sub.overdueAmount === 0 && sub.status === 'ACTIVE' && (
                                                <span className="badge success text-xs">On Track</span>
                                            )}
                                        </div>
                                        <ChevronRight size={20} className="text-[var(--text-muted)]" />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <Users size={48} className="mb-4" />
                                <p>No members enrolled</p>
                                <Link href={`/groups/${groupId}/enroll`} className="btn btn-primary mt-4">
                                    Enroll Member
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'winners' && (
                    <div>
                        {winners.length > 0 ? (
                            <div className="rounded-xl overflow-hidden">
                                {winners.map((winner) => (
                                    <div key={winner._id} className="list-item">
                                        <div className="w-10 h-10 rounded-full bg-[var(--warning)]/20 flex items-center justify-center flex-shrink-0">
                                            <Trophy size={20} className="text-[var(--warning)]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{winner.memberId?.name || 'Unknown'}</p>
                                            <p className="text-sm text-[var(--text-muted)]">
                                                Period {winner.basePeriodNumber} • {winner.selectionMethod}
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
                                <p>No winners yet</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* FAB - Enroll Member */}
            {activeTab === 'members' && (
                <Link href={`/groups/${groupId}/enroll`} className="fab">
                    <Plus size={24} />
                </Link>
            )}
        </div>
    );
}
