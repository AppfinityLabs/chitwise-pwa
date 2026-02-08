'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dashboardApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Search,
  MoreHorizontal,
  Bell
} from 'lucide-react';
import Link from 'next/link';

// --- Types ---
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

// --- Utilities ---
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ModernDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'activity' | 'pending'>('activity');

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
    if (user) loadDashboard();
  }, [user, authLoading]);

  async function loadDashboard() {
    try {
      const result = await dashboardApi.get();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // --- Loading Skeleton (Minimal) ---
  if (authLoading || loading) {
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
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <span className="text-sm font-medium text-zinc-400">Overview</span>
        </div>
        <button className="p-2 rounded-full hover:bg-white/5 transition-colors relative">
          <Bell size={20} className="text-zinc-400" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-zinc-950"></span>
        </button>
      </header>

      <main className="p-6 pb-24 space-y-8">

        {/* 1. Hero Card - "The Credit Card Look" */}
        <section className="relative overflow-hidden rounded-[2rem] bg-zinc-900 border border-white/10 p-6 shadow-2xl shadow-black/50">
          {/* Decorative background glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-zinc-400 text-sm font-medium mb-1">Total Collections</p>
                <h2 className="text-4xl font-light tracking-tight text-white">
                  {formatCurrency(data?.stats.totalCollections || 0)}
                </h2>
              </div>
              <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/20">
                +{collectionPercentage}% collected
              </div>
            </div>

            {/* Mini Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Progress</span>
                <span>Goal: {formatCurrency(totalBalance)}</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                  style={{ width: `${collectionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. Secondary Stats Strip */}
        <section className="flex justify-between gap-4">
          <Link href="/groups" className="flex-1 bg-zinc-900/50 border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform">
            <span className="text-2xl font-semibold text-white">{data?.stats.activeGroups}</span>
            <span className="text-xs text-zinc-500">Groups</span>
          </Link>
          <Link href="/members" className="flex-1 bg-zinc-900/50 border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform">
            <span className="text-2xl font-semibold text-white">{data?.stats.activeMembers}</span>
            <span className="text-xs text-zinc-500">Members</span>
          </Link>
          <div className="flex-1 bg-zinc-900/50 border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-1">
            <span className="text-2xl font-semibold text-rose-400">{data?.stats.pendingDues ? '!' : '0'}</span>
            <span className="text-xs text-zinc-500">Alerts</span>
          </div>
        </section>

        {/* 3. Unified Activity Section */}
        <section>
          {/* Custom Tabs */}
          <div className="flex items-center gap-6 border-b border-white/5 pb-2 mb-4">
            <button
              onClick={() => setActiveTab('activity')}
              className={`text-sm font-medium pb-2 -mb-2.5 transition-colors ${activeTab === 'activity' ? 'text-white border-b-2 border-indigo-500' : 'text-zinc-500'}`}
            >
              Recent Activity
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`text-sm font-medium pb-2 -mb-2.5 transition-colors ${activeTab === 'pending' ? 'text-white border-b-2 border-rose-500' : 'text-zinc-500'}`}
            >
              Pending Dues
            </button>
          </div>

          <div className="space-y-3">
            {activeTab === 'activity' ? (
              data?.recentCollections?.length ? (
                data.recentCollections.map((col) => (
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
                ))
              ) : (
                <EmptyState label="No recent activity" />
              )
            ) : (
              data?.pendingDuesList?.length ? (
                data.pendingDuesList.map((sub) => (
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
                ))
              ) : (
                <EmptyState label="All dues cleared!" />
              )
            )}
          </div>

          <Link href="/collections" className="block text-center text-xs text-zinc-500 mt-6 hover:text-zinc-300 transition-colors">
            View full history
          </Link>
        </section>
      </main>

      {/* 4. Modern Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          href="/collections/new"
          className="h-14 w-14 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        >
          <Plus size={28} />
        </Link>
      </div>

      {/* Optional Bottom Bar for Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-zinc-950/90 backdrop-blur-xl border-t border-white/5 pb-safe">
        {/* Add standard nav items here (Home, Groups, Profile) */}
      </nav>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-8 text-center border border-dashed border-white/10 rounded-xl">
      <p className="text-zinc-500 text-sm">{label}</p>
    </div>
  );
}