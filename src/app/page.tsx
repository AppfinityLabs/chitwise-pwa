'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePush } from '@/context/PushContext';
import { useDashboard } from '@/lib/swr';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  ArrowDownLeft,
  Plus,
  Bell,
  X,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types & Utils ---
interface DashboardData {
  stats: {
    activeGroups: number;
    totalCollections: number;
    activeMembers: number;
    pendingDues: number;
  };
  recentCollections: any[];
  pendingDuesList: any[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function AnimatedDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const {
    isSupported,
    isSubscribed,
    permission,
    isLoading: pushLoading,
    showInstallPrompt,
    subscribe,
    dismissBanner,
    bannerDismissed,
  } = usePush();

  // SWR hook for dashboard data - caches and revalidates automatically
  const { data, isLoading } = useDashboard();
  const [activeTab, setActiveTab] = useState<'activity' | 'pending'>('activity');

  // Show notification banner when: supported, not subscribed, not dismissed, permission not denied
  const showNotificationBanner =
    user &&
    !bannerDismissed &&
    ((isSupported && !isSubscribed && permission !== 'denied') || showInstallPrompt);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  // --- Loading Skeleton ---
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6 flex flex-col gap-6">
        <div className="h-10 w-10 bg-zinc-900 rounded-full animate-pulse" />
        <div className="h-48 w-full bg-zinc-900 rounded-3xl animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 w-full bg-zinc-900/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const totalBalance = (data?.stats.totalCollections || 0) + (data?.stats.pendingDues || 0);
  const collectionPercentage = totalBalance > 0
    ? Math.round(((data?.stats.totalCollections || 0) / totalBalance) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">

      {/* Top Navigation */}
      <header className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold shadow-lg shadow-indigo-500/20">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <span className="text-sm font-medium text-zinc-400">Overview</span>
        </div>
        <button
          onClick={() => {
            if (!isSubscribed && isSupported && permission !== 'denied') {
              subscribe();
            } else {
              router.push('/settings');
            }
          }}
          className="p-2 rounded-full hover:bg-white/5 transition-colors relative"
        >
          <Bell size={20} className={isSubscribed ? 'text-indigo-400' : 'text-zinc-400'} />
          {!isSubscribed && isSupported && permission !== 'denied' && (
            <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-zinc-950"></span>
          )}
        </button>
      </header>

      {/* Push Notification Banner */}
      <AnimatePresence>
        {showNotificationBanner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mt-2"
          >
            <div className="relative bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-2xl p-4">
              <button
                onClick={dismissBanner}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 text-zinc-400"
              >
                <X size={14} />
              </button>
              {showInstallPrompt ? (
                <div className="flex items-start gap-3 pr-6">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                    <Download size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">Install ChitWise</p>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                      Tap <span className="text-zinc-200">Share</span> → <span className="text-zinc-200">Add to Home Screen</span> to receive push notifications
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 pr-6">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                    <Bell size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">Enable Notifications</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Stay updated with collections, dues & announcements</p>
                    <button
                      onClick={subscribe}
                      disabled={pushLoading}
                      className="mt-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-full transition-colors disabled:opacity-50"
                    >
                      {pushLoading ? 'Enabling...' : 'Enable'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="p-6 pb-28 space-y-8"
      >

        {/* 1. Hero Card */}
        <motion.section
          variants={itemVariants}
          className="relative overflow-hidden rounded-[2rem] bg-zinc-900 border border-white/10 p-6 shadow-2xl shadow-black/50"
        >
          {/* Decorative background glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none mix-blend-screen" />

          <div className="relative z-10 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-zinc-400 text-sm font-medium mb-1">Total Collections</p>
                {/* Animate the number entrance */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-4xl font-light tracking-tight text-white"
                >
                  {formatCurrency(data?.stats.totalCollections || 0)}
                </motion.h2>
              </div>
              <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/20">
                +{collectionPercentage}% collected
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Progress</span>
                <span>Goal: {formatCurrency(totalBalance)}</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${collectionPercentage}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* 2. Secondary Stats Strip */}
        <motion.section variants={itemVariants} className="flex justify-between gap-4">
          <StatsPill href="/groups" value={data?.stats.activeGroups} label="Groups" />
          <StatsPill href="/members" value={data?.stats.activeMembers} label="Members" />
          <div className="flex-1 bg-zinc-900/50 border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-1">
            <span className="text-2xl font-semibold text-rose-400">{data?.stats.pendingDues ? '!' : '0'}</span>
            <span className="text-xs text-zinc-500">Alerts</span>
          </div>
        </motion.section>

        {/* 3. Unified Activity Section */}
        <motion.section variants={itemVariants}>
          {/* Animated Tab Switcher */}
          <div className="flex items-center gap-6 border-b border-white/5 pb-2 mb-4">
            {['activity', 'pending'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className="relative pb-2 -mb-2.5 text-sm font-medium transition-colors"
              >
                <span className={activeTab === tab ? 'text-white' : 'text-zinc-500'}>
                  {tab === 'activity' ? 'Recent Activity' : 'Pending Dues'}
                </span>
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${tab === 'activity' ? 'bg-indigo-500' : 'bg-rose-500'}`}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="space-y-3 min-h-[200px]">
            <AnimatePresence mode="wait">
              {activeTab === 'activity' ? (
                <ActivityList key="activity" items={data?.recentCollections || []} />
              ) : (
                <PendingList key="pending" items={data?.pendingDuesList || []} />
              )}
            </AnimatePresence>
          </div>

          <Link href="/collections" className="block text-center text-xs text-zinc-500 mt-3 hover:text-zinc-300 transition-colors">
            View full history
          </Link>
        </motion.section>
      </motion.main>

      {/* 4. FAB */}
      <div className="fixed bottom-24 right-6 z-50">
        <Link
          href="/collections/new"
          className="h-14 w-14 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        >
          <Plus size={28} />
        </Link>
      </div>
    </div>
  );
}

// --- Sub-components for cleaner code ---

function StatsPill({ href, value, label }: any) {
  return (
    <Link href={href} className="flex-1 bg-zinc-900/50 border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform">
      <span className="text-2xl font-semibold text-white">{value || 0}</span>
      <span className="text-xs text-zinc-500">{label}</span>
    </Link>
  );
}

function ActivityList({ items }: { items: any[] }) {
  if (!items?.length) return <EmptyState label="No recent activity" />;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="space-y-3"
    >
      {items.map((col) => (
        <div key={col._id} className="group flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5 text-zinc-400">
              <ArrowDownLeft size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">{col.memberId?.name}</p>
              <p className="text-xs text-zinc-500">{col.groupId?.groupName}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-emerald-400">+{formatCurrency(col.amountPaid)}</p>
            <p className="text-[10px] text-zinc-600">
              {new Date(col.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

function PendingList({ items }: { items: any[] }) {
  if (!items?.length) return <EmptyState label="All dues cleared!" />;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-3"
    >
      {items.map((sub) => (
        <Link href={`/collections/new?subscription=${sub._id}`} key={sub._id} className="group flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-400">
              <Wallet size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">{sub.memberId?.name}</p>
              <p className="text-xs text-zinc-500">Due {new Date().getDate()}th</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-zinc-200">{formatCurrency(sub.pendingAmount)}</p>
            <p className="text-[10px] text-rose-400 font-medium">Pay Now</p>
          </div>
        </Link>
      ))}
    </motion.div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-8 text-center border border-dashed border-white/10 rounded-xl"
    >
      <p className="text-zinc-500 text-sm">{label}</p>
    </motion.div>
  );
}