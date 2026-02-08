'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { membersApi } from '@/lib/api';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewMemberPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await membersApi.create(form);
            router.push('/members');
        } catch (err: any) {
            setError(err.message || 'Failed to create member');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="page">
            <div className="page-header flex items-center gap-3">
                <Link href="/members" className="p-2 -ml-2 rounded-lg">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="page-title">New Member</h1>
                    <p className="page-subtitle">Add a new member</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="page-content space-y-4">
                {error && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label className="label">Full Name *</label>
                    <input
                        type="text"
                        name="name"
                        className="input"
                        placeholder="Enter full name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label className="label">Phone Number *</label>
                    <input
                        type="tel"
                        name="phone"
                        className="input"
                        placeholder="9876543210"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        pattern="[0-9]{10}"
                    />
                </div>

                <div>
                    <label className="label">Email</label>
                    <input
                        type="email"
                        name="email"
                        className="input"
                        placeholder="email@example.com"
                        value={form.email}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="label">Address</label>
                    <textarea
                        name="address"
                        className="input min-h-[100px] resize-none"
                        placeholder="Enter address"
                        value={form.address}
                        onChange={handleChange}
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
                            'Add Member'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
