'use client';

import { useState, useEffect } from 'react';
import { membersApi } from '@/lib/api';
import { Plus, Search, ChevronRight, User, Phone } from 'lucide-react';
import Link from 'next/link';

export default function MembersPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadMembers();
    }, []);

    async function loadMembers() {
        try {
            const data = await membersApi.list();
            setMembers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const filteredMembers = members.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.phone.includes(search)
    );

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">Members</h1>
                <p className="page-subtitle">{members.length} total members</p>
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
                        placeholder="Search name or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Members List */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="card h-16 animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredMembers.length > 0 ? (
                    <div className="rounded-xl overflow-hidden">
                        {filteredMembers.map((member) => (
                            <Link
                                key={member._id}
                                href={`/members/${member._id}`}
                                className="list-item"
                            >
                                <div className="w-10 h-10 rounded-full bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0">
                                    <User size={20} className="text-[var(--primary)]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{member.name}</p>
                                    <p className="text-sm text-[var(--text-muted)] flex items-center gap-1">
                                        <Phone size={12} />
                                        {member.phone}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`badge ${member.status === 'ACTIVE' ? 'success' : 'warning'}`}>
                                        {member.status}
                                    </span>
                                    <ChevronRight size={20} className="text-[var(--text-muted)]" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <User size={48} className="mb-4" />
                        <p>No members found</p>
                        <Link href="/members/new" className="btn btn-primary mt-4">
                            Add First Member
                        </Link>
                    </div>
                )}
            </div>

            {/* FAB */}
            <Link href="/members/new" className="fab">
                <Plus size={24} />
            </Link>
        </div>
    );
}
