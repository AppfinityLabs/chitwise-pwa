'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { notificationsApi } from '@/lib/api';
import {
    Bell,
    BellOff,
    Zap,
    ChevronRight,
    Loader2,
    RefreshCw,
    ExternalLink,
    Image as ImageIcon,
    X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Notification {
    _id: string;
    title: string;
    body: string;
    image?: string;
    url?: string;
    priority: 'normal' | 'urgent';
    sentAt: string;
    targetType: string;
}

export default function NotificationsInboxPage() {
    const { user, loading: authLoading } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
        try {
            const data = await notificationsApi.history(pageNum, 20);
            if (append) {
                setNotifications(prev => [...prev, ...data.notifications]);
            } else {
                setNotifications(data.notifications);
            }
            setTotalPages(data.pagination.pages);
            setPage(pageNum);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && user) {
            fetchNotifications();
        }
    }, [authLoading, user, fetchNotifications]);

    async function handleRefresh() {
        setRefreshing(true);
        await fetchNotifications(1);
    }

    async function handleLoadMore() {
        if (page < totalPages) {
            await fetchNotifications(page + 1, true);
        }
    }

    function formatTime(dateStr: string) {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-28">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Bell size={18} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">Notifications</h1>
                            <p className="text-[11px] text-zinc-500">
                                {notifications.length > 0 ? `${notifications.length} notification${notifications.length !== 1 ? 's' : ''}` : 'No notifications'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2.5 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            {/* Empty State */}
            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-32 px-6 text-center">
                    <div className="h-20 w-20 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-6">
                        <BellOff size={32} className="text-zinc-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-zinc-300 mb-2">All Caught Up</h2>
                    <p className="text-sm text-zinc-500 max-w-xs">
                        You&apos;ll see notifications here when your admin sends updates
                    </p>
                </div>
            ) : (
                <div className="px-4 pt-3 space-y-2">
                    <AnimatePresence initial={false}>
                        {notifications.map((notif, index) => (
                            <motion.div
                                key={notif._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                            >
                                <button
                                    onClick={() => setExpandedId(expandedId === notif._id ? null : notif._id)}
                                    className="w-full text-left"
                                >
                                    <div className={`rounded-2xl border transition-all overflow-hidden ${
                                        expandedId === notif._id
                                            ? 'bg-zinc-900 border-white/10'
                                            : 'bg-zinc-900/50 border-white/5 hover:border-white/10'
                                    } ${notif.priority === 'urgent' ? 'ring-1 ring-red-500/20' : ''}`}>

                                        {/* Collapsed View */}
                                        <div className="p-4">
                                            <div className="flex items-start gap-3">
                                                {/* Icon */}
                                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                    notif.priority === 'urgent'
                                                        ? 'bg-red-500/10'
                                                        : 'bg-indigo-500/10'
                                                }`}>
                                                    {notif.priority === 'urgent'
                                                        ? <Zap size={18} className="text-red-400" />
                                                        : <Bell size={18} className="text-indigo-400" />
                                                    }
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <h3 className="text-sm font-semibold text-white truncate">{notif.title}</h3>
                                                        {notif.priority === 'urgent' && (
                                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/15 text-red-400 border border-red-500/20 shrink-0">
                                                                URGENT
                                                            </span>
                                                        )}
                                                        {notif.image && (
                                                            <ImageIcon size={12} className="text-zinc-500 shrink-0" />
                                                        )}
                                                    </div>
                                                    <p className={`text-[13px] text-zinc-400 ${expandedId === notif._id ? '' : 'line-clamp-2'}`}>
                                                        {notif.body}
                                                    </p>
                                                    <p className="text-[11px] text-zinc-600 mt-1.5">
                                                        {formatTime(notif.sentAt)}
                                                    </p>
                                                </div>

                                                <ChevronRight
                                                    size={16}
                                                    className={`text-zinc-600 shrink-0 transition-transform mt-1 ${
                                                        expandedId === notif._id ? 'rotate-90' : ''
                                                    }`}
                                                />
                                            </div>
                                        </div>

                                        {/* Expanded Content */}
                                        <AnimatePresence>
                                            {expandedId === notif._id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    {/* Image Banner */}
                                                    {notif.image && (
                                                        <div className="px-4 pb-3">
                                                            <img
                                                                src={notif.image}
                                                                alt=""
                                                                className="w-full h-44 object-cover rounded-xl border border-white/5"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Full body text */}
                                                    <div className="px-4 pb-4">
                                                        <p className="text-[13px] text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                                            {notif.body}
                                                        </p>

                                                        {/* Action link */}
                                                        {notif.url && notif.url !== '/' && (
                                                            <Link
                                                                href={notif.url}
                                                                className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-400 font-medium hover:bg-indigo-500/20 transition-colors"
                                                            >
                                                                <ExternalLink size={12} />
                                                                Open Link
                                                            </Link>
                                                        )}

                                                        <p className="text-[10px] text-zinc-600 mt-3">
                                                            {new Date(notif.sentAt).toLocaleDateString('en-IN', {
                                                                weekday: 'short',
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Load More */}
                    {page < totalPages && (
                        <div className="pt-4 pb-2 flex justify-center">
                            <button
                                onClick={handleLoadMore}
                                className="px-5 py-2.5 bg-zinc-900 border border-white/5 rounded-xl text-sm text-zinc-400 hover:text-white hover:border-white/10 transition-colors"
                            >
                                Load More
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
