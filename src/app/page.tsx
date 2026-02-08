'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dashboardApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Grid3X3, Wallet, Users, AlertCircle, ChevronRight, Plus, TrendingUp } from 'lucide-react';
import Link from 'next/link';

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

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
      return;
    }
    if (user) {
      loadDashboard();
    }
  }, [user, authLoading]);

  async function loadDashboard() {
    try {
      const result = await dashboardApi.get();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="h-8 w-32 bg-[var(--card)] rounded animate-pulse"></div>
          <div className="h-4 w-48 bg-[var(--card)] rounded animate-pulse mt-2"></div>
        </div>
        <div className="page-content">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-[var(--card)] rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
        </div>
        <div className="page-content">
          <div className="empty-state">
            <AlertCircle size={48} className="mb-4 text-[var(--error)]" />
            <p>{error}</p>
            <button onClick={loadDashboard} className="btn btn-primary mt-4">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <p className="text-[var(--text-muted)] text-sm">Welcome back,</p>
        <h1 className="page-title">{user?.name || 'Admin'}</h1>
      </div>

      <div className="page-content space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/groups" className="stat-card">
            <Grid3X3 size={24} className="mb-2 opacity-80" />
            <p className="text-2xl font-bold">{data?.stats.activeGroups || 0}</p>
            <p className="text-sm opacity-80">Active Groups</p>
          </Link>

          <div className="stat-card success">
            <TrendingUp size={24} className="mb-2 opacity-80" />
            <p className="text-2xl font-bold">{formatCurrency(data?.stats.totalCollections || 0)}</p>
            <p className="text-sm opacity-80">Collections</p>
          </div>

          <Link href="/members" className="stat-card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
            <Users size={24} className="mb-2 opacity-80" />
            <p className="text-2xl font-bold">{data?.stats.activeMembers || 0}</p>
            <p className="text-sm opacity-80">Members</p>
          </Link>

          <div className="stat-card warning">
            <AlertCircle size={24} className="mb-2 opacity-80" />
            <p className="text-2xl font-bold">{formatCurrency(data?.stats.pendingDues || 0)}</p>
            <p className="text-sm opacity-80">Pending Dues</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            <Link href="/collections/new" className="btn btn-primary whitespace-nowrap">
              <Wallet size={18} />
              Record Collection
            </Link>
            <Link href="/members/new" className="btn btn-secondary whitespace-nowrap">
              <Plus size={18} />
              Add Member
            </Link>
            <Link href="/groups/new" className="btn btn-secondary whitespace-nowrap">
              <Plus size={18} />
              New Group
            </Link>
          </div>
        </div>

        {/* Recent Collections */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Recent Collections</h2>
            <Link href="/collections" className="text-[var(--primary)] text-sm font-medium">
              View All
            </Link>
          </div>

          {data?.recentCollections && data.recentCollections.length > 0 ? (
            <div className="rounded-xl overflow-hidden">
              {data.recentCollections.slice(0, 5).map((col: any) => (
                <div key={col._id} className="list-item">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{col.memberId?.name || 'Unknown'}</p>
                    <p className="text-sm text-[var(--text-muted)] truncate">
                      {col.groupId?.groupName || 'Unknown Group'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[var(--success)]">
                      {formatCurrency(col.amountPaid)}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {new Date(col.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-8">
              <p className="text-[var(--text-muted)]">No recent collections</p>
            </div>
          )}
        </div>

        {/* Pending Dues */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Pending Dues</h2>
          </div>

          {data?.pendingDuesList && data.pendingDuesList.length > 0 ? (
            <div className="rounded-xl overflow-hidden">
              {data.pendingDuesList.slice(0, 5).map((sub: any) => (
                <Link
                  key={sub._id}
                  href={`/collections/new?subscription=${sub._id}`}
                  className="list-item"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{sub.memberId?.name || 'Unknown'}</p>
                    <p className="text-sm text-[var(--text-muted)]">
                      Pending: <span className="text-[var(--warning)]">{formatCurrency(sub.pendingAmount)}</span>
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-[var(--text-muted)]" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="card text-center py-8">
              <p className="text-[var(--text-muted)]">No pending dues</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
