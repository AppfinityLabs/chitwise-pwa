'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { membersApi, subscriptionsApi, collectionsApi } from '@/lib/api';
import { ArrowLeft, User, Phone, Mail, MapPin, ChevronRight, Wallet } from 'lucide-react';
import Link from 'next/link';

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function MemberDetailPage() {
    const params = useParams();
    const memberId = params.id as string;

    const [member, setMember] = useState<any>(null);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [memberId]);

    async function loadData() {
        try {
            const [memberData, subsData] = await Promise.all([
                membersApi.get(memberId),
                subscriptionsApi.list({ memberId }),
            ]);
            setMember(memberData);
            setSubscriptions(subsData);
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
                    <div className="loader"></div>
                </div>
            </div>
        );
    }

    if (!member) {
        return (
            <div className="page">
                <div className="page-header flex items-center gap-3">
                    <Link href="/members" className="p-2 -ml-2">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="page-title">Member Not Found</h1>
                </div>
            </div>
        );
    }

    const totalPending = subscriptions.reduce((sum, s) => sum + (s.pendingAmount || 0), 0);

    return (
        <div className="page">
            <div className="page-header flex items-center gap-3">
                <Link href="/members" className="p-2 -ml-2 rounded-lg">
                    <ArrowLeft size={24} />
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="page-title truncate">{member.name}</h1>
                    <span className={`badge ${member.status === 'ACTIVE' ? 'success' : 'warning'}`}>
                        {member.status}
                    </span>
                </div>
            </div>

            <div className="page-content space-y-4">
                {/* Contact Info */}
                <div className="card space-y-3">
                    <div className="flex items-center gap-3">
                        <Phone size={18} className="text-[var(--text-muted)]" />
                        <a href={`tel:${member.phone}`} className="text-[var(--primary)]">
                            {member.phone}
                        </a>
                    </div>
                    {member.email && (
                        <div className="flex items-center gap-3">
                            <Mail size={18} className="text-[var(--text-muted)]" />
                            <a href={`mailto:${member.email}`} className="text-[var(--primary)]">
                                {member.email}
                            </a>
                        </div>
                    )}
                    {member.address && (
                        <div className="flex items-start gap-3">
                            <MapPin size={18} className="text-[var(--text-muted)] mt-0.5" />
                            <p>{member.address}</p>
                        </div>
                    )}
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="card">
                        <p className="text-2xl font-bold">{subscriptions.length}</p>
                        <p className="text-sm text-[var(--text-muted)]">Active Groups</p>
                    </div>
                    <div className="card">
                        <p className={`text-2xl font-bold ${totalPending > 0 ? 'text-[var(--warning)]' : 'text-[var(--success)]'}`}>
                            {formatCurrency(totalPending)}
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">Total Pending</p>
                    </div>
                </div>

                {/* Subscriptions */}
                <div>
                    <h2 className="text-lg font-semibold mb-3">Group Subscriptions</h2>
                    {subscriptions.length > 0 ? (
                        <div className="rounded-xl overflow-hidden">
                            {subscriptions.map((sub) => (
                                <Link
                                    key={sub._id}
                                    href={`/collections/new?subscription=${sub._id}`}
                                    className="list-item"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0">
                                        <Wallet size={20} className="text-[var(--primary)]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{sub.groupId?.groupName || 'Unknown'}</p>
                                        <p className="text-sm text-[var(--text-muted)]">
                                            {sub.units} unit(s) • {sub.collectionPattern}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        {sub.overdueAmount > 0 ? (
                                            <span className="badge error">{formatCurrency(sub.overdueAmount)} due</span>
                                        ) : (
                                            <span className="badge success">On Track</span>
                                        )}
                                    </div>
                                    <ChevronRight size={20} className="text-[var(--text-muted)]" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="card text-center py-8">
                            <p className="text-[var(--text-muted)]">Not enrolled in any groups</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
