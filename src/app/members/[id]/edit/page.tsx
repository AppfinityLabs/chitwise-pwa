'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Save, User } from 'lucide-react';
import { useMember, invalidateAfterMemberCreate } from '@/lib/swr';
import { membersApi } from '@/lib/api';

export default function EditMemberPage() {
    const params = useParams();
    const router = useRouter();
    const memberId = params.id as string;
    const { data: member, isLoading } = useMember(memberId);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        status: 'ACTIVE',
    });

    useEffect(() => {
        if (member) {
            setFormData({
                name: member.name || '',
                phone: member.phone || '',
                email: member.email || '',
                address: member.address || '',
                status: member.status || 'ACTIVE',
            });
        }
    }, [member]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await membersApi.update(memberId, formData);
            await invalidateAfterMemberCreate();
            router.push(`/members/${memberId}`);
        } catch (err: any) {
            alert(err.message || 'Failed to update');
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="animate-spin text-zinc-500" size={24} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
            <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/5 text-zinc-400 transition-colors">
                    <ArrowLeft size={22} />
                </button>
                <div>
                    <h1 className="text-lg font-medium text-white">Edit Member</h1>
                    <p className="text-xs text-zinc-500">{member?.name}</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="p-4 max-w-lg mx-auto space-y-5">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider pl-1">Full Name</label>
                    <input
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 text-white rounded-2xl py-3.5 px-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider pl-1">Phone Number</label>
                    <input
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 text-white rounded-2xl py-3.5 px-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider pl-1">Email (Optional)</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 text-white rounded-2xl py-3.5 px-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider pl-1">Address (Optional)</label>
                    <textarea
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        rows={3}
                        className="w-full bg-zinc-900 border border-white/10 text-white rounded-2xl py-3.5 px-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider pl-1">Status</label>
                    <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 text-white rounded-2xl py-3.5 px-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 appearance-none"
                    >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full h-14 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4"
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Save Changes
                </button>
            </form>
        </div>
    );
}
