'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { membersApi } from '@/lib/api';
import { invalidateAfterMemberCreate } from '@/lib/swr';
import {
    ArrowLeft,
    Loader2,
    User,
    Phone,
    Mail,
    MapPin,
    Sparkles,
    Camera
} from 'lucide-react';
import Link from 'next/link';

export default function ModernNewMemberPage() {
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
        const { name, value } = e.target;
        // Limit phone to numbers only (optional UX improvement)
        if (name === 'phone' && !/^\d*$/.test(value)) return;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    // Dynamic Initials for Avatar
    const getInitials = (name: string) => {
        if (!name) return '';
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await membersApi.create(form);
            // Update cache so new member appears immediately
            await invalidateAfterMemberCreate();
            router.push('/members');
        } catch (err: any) {
            setError(err.message || 'Failed to create member');
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-24">

            {/* Header */}
            <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/5 text-zinc-400 transition-colors">
                    <ArrowLeft size={22} />
                </button>
                <h1 className="text-lg font-medium text-white">New Contact</h1>
            </header>

            <main className="p-6 max-w-lg mx-auto">

                {/* 1. Live Avatar Preview */}
                <div className="flex flex-col items-center mb-8 relative">
                    <div className="relative group cursor-pointer">
                        <div className={`h-28 w-28 rounded-full flex items-center justify-center text-3xl font-bold shadow-2xl transition-all duration-500 ${form.name
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                            : 'bg-zinc-900 border border-white/10 text-zinc-600'
                            }`}>
                            {form.name ? getInitials(form.name) : <User size={40} strokeWidth={1.5} />}
                        </div>

                        {/* decorative shimmer/glow if active */}
                        {form.name && (
                            <div className="absolute -inset-1 bg-indigo-500/20 rounded-full blur-xl -z-10 animate-pulse" />
                        )}

                        {/* Camera Icon Overlay (Visual only, implies upload capability) */}
                        <div className="absolute bottom-0 right-0 p-2 bg-zinc-800 rounded-full border border-zinc-950 shadow-lg text-zinc-400">
                            <Camera size={14} />
                        </div>
                    </div>
                    <p className="mt-4 text-zinc-500 text-sm font-medium">
                        {form.name || 'New Member'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 animate-in slide-in-from-top-2">
                            <div className="h-2 w-2 rounded-full bg-rose-500" />
                            <p className="text-rose-200 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Name Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-400 ml-1">Full Name <span className="text-rose-500">*</span></label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                name="name"
                                className="w-full bg-zinc-900 border border-white/5 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600 shadow-inner"
                                placeholder="e.g. Adarsh P"
                                value={form.name}
                                onChange={handleChange}
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Phone Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-400 ml-1">Phone Number <span className="text-rose-500">*</span></label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
                                <Phone size={18} />
                            </div>
                            <input
                                type="tel"
                                name="phone"
                                className="w-full bg-zinc-900 border border-white/5 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600 shadow-inner tracking-wide"
                                placeholder="98765 43210"
                                value={form.phone}
                                onChange={handleChange}
                                required
                                maxLength={10}
                            />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-400 ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                name="email"
                                className="w-full bg-zinc-900 border border-white/5 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600 shadow-inner"
                                placeholder="adarsh@example.com"
                                value={form.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Address Textarea */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-400 ml-1">Address</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                                <MapPin size={18} />
                            </div>
                            <textarea
                                name="address"
                                className="w-full bg-zinc-900 border border-white/5 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600 min-h-[120px] resize-none shadow-inner"
                                placeholder="Enter full residential address..."
                                value={form.address}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-medium shadow-[0_4px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_4px_25px_rgba(79,70,229,0.4)] flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Sparkles size={18} />
                                    <span>Create Contact</span>
                                </div>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}