'use client';

import { useState, useEffect } from 'react';
import { groupsApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  LayoutGrid, 
  Users, 
  TrendingUp,
  MoreHorizontal 
} from 'lucide-react';
import Link from 'next/link';

// --- Utilities ---
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ModernGroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    try {
      const data = await groupsApi.list();
      setGroups(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredGroups = groups.filter((g) =>
    g.groupName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-24">
      {/* Header & Search Stack */}
      <div className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 px-6 pt-6 pb-4 space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Your Groups</h1>
            <p className="text-zinc-500 text-sm mt-1">Manage your savings circles</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
            <span className="text-xs font-medium text-zinc-400">{groups.length}</span>
          </div>
        </div>

        {/* Search Bar - Floating Glass Style */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={18} className="text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input
            type="text"
            className="w-full bg-zinc-900/50 border border-white/5 text-sm text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:bg-zinc-900 transition-all placeholder:text-zinc-600"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="p-6 space-y-4">
        {loading ? (
          // Skeleton Loader
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-zinc-900 rounded-2xl animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filteredGroups.length > 0 ? (
          <div className="grid gap-4">
            {filteredGroups.map((group) => {
              // Calculate progress percentage
              const progress = Math.min(
                100, 
                Math.round((group.currentPeriod / group.totalPeriods) * 100)
              );

              return (
                <Link
                  key={group._id}
                  href={`/groups/${group._id}`}
                  className="group relative block bg-zinc-900/40 border border-white/5 rounded-2xl p-5 overflow-hidden transition-all hover:bg-zinc-900 hover:border-white/10 active:scale-[0.98]"
                >
                  {/* Status Indicator (Top Right) */}
                  <div className="absolute top-5 right-5 flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${
                      group.status === 'ACTIVE' 
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' 
                        : 'bg-amber-500'
                    }`} />
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-col h-full gap-4">
                    {/* Icon & Name */}
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/5 flex items-center justify-center text-indigo-400">
                        <LayoutGrid size={22} strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg text-zinc-100 leading-tight">
                          {group.groupName}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-medium">
                          {group.frequency}
                        </p>
                      </div>
                    </div>

                    {/* Financials */}
                    <div className="mt-2">
                      <p className="text-zinc-500 text-xs mb-1">Contribution</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-light text-white tracking-tight">
                          {formatCurrency(group.contributionAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Section */}
                    <div className="space-y-2 mt-2 pt-4 border-t border-white/5">
                      <div className="flex justify-between text-xs text-zinc-400">
                        <span className="flex items-center gap-1.5">
                          <Users size={12} />
                          {group.totalUnits} Members
                        </span>
                        <span>
                          Period {group.currentPeriod}<span className="text-zinc-600">/{group.totalPeriods}</span>
                        </span>
                      </div>
                      
                      {/* Custom Progress Bar */}
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500/80 rounded-full" 
                          style={{ width: `${progress}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-3xl bg-zinc-900/20">
            <div className="h-16 w-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
              <Search size={24} className="text-zinc-600" />
            </div>
            <p className="text-zinc-400 font-medium">No groups found</p>
            <p className="text-zinc-600 text-sm mt-1 max-w-[200px]">
              Try adjusting your search or create a new group.
            </p>
            <button 
                onClick={() => setSearch('')}
                className="mt-4 text-indigo-400 text-sm font-medium hover:text-indigo-300"
            >
                Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Button (Consistent with Dashboard) */}
      <div className="fixed bottom-24 right-6 z-40">
        <Link 
          href="/groups/new" 
          className="h-14 w-14 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        >
          <Plus size={28} />
        </Link>
      </div>
    </div>
  );
}