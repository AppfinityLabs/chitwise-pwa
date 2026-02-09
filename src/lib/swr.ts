'use client';

import useSWR, { SWRConfiguration, mutate as globalMutate } from 'swr';
import {
    dashboardApi,
    groupsApi,
    membersApi,
    subscriptionsApi,
    collectionsApi,
    winnersApi,
    reportsApi,
} from './api';

// =============================================================================
// Global SWR Configuration
// =============================================================================
export const swrConfig: SWRConfiguration = {
    revalidateOnFocus: true,        // Revalidate when tab becomes active
    revalidateOnReconnect: true,    // Revalidate on network recovery
    dedupingInterval: 5000,         // Dedupe requests within 5s
    focusThrottleInterval: 10000,   // Throttle focus revalidation to 10s
    errorRetryCount: 3,             // Retry failed requests 3 times
    keepPreviousData: true,         // Keep showing old data while loading new
};

// =============================================================================
// Cache Key Constants
// =============================================================================
export const CACHE_KEYS = {
    DASHBOARD: '/dashboard',
    GROUPS: '/groups',
    GROUP: (id: string) => `/groups/${id}`,
    MEMBERS: '/members',
    MEMBER: (id: string) => `/members/${id}`,
    SUBSCRIPTIONS: (filters?: { groupId?: string; memberId?: string }) => {
        const base = '/subscriptions';
        if (!filters?.groupId && !filters?.memberId) return base;
        return `${base}?${new URLSearchParams(filters as Record<string, string>).toString()}`;
    },
    COLLECTIONS: (filters?: { groupId?: string; memberId?: string; groupMemberId?: string }) => {
        const base = '/collections';
        if (!filters?.groupId && !filters?.memberId && !filters?.groupMemberId) return base;
        return `${base}?${new URLSearchParams(filters as Record<string, string>).toString()}`;
    },
    WINNERS: (filters?: { groupId?: string }) => {
        const base = '/winners';
        if (!filters?.groupId) return base;
        return `${base}?groupId=${filters.groupId}`;
    },
    REPORTS: '/reports',
};

// =============================================================================
// Dashboard Hook
// =============================================================================
export function useDashboard() {
    return useSWR(
        CACHE_KEYS.DASHBOARD,
        () => dashboardApi.get(),
        swrConfig
    );
}

// =============================================================================
// Groups Hooks
// =============================================================================
export function useGroups() {
    return useSWR(
        CACHE_KEYS.GROUPS,
        () => groupsApi.list(),
        swrConfig
    );
}

export function useGroup(id: string | undefined) {
    return useSWR(
        id ? CACHE_KEYS.GROUP(id) : null, // null key = don't fetch
        () => groupsApi.get(id!),
        swrConfig
    );
}

// =============================================================================
// Members Hooks
// =============================================================================
export function useMembers() {
    return useSWR(
        CACHE_KEYS.MEMBERS,
        () => membersApi.list(),
        swrConfig
    );
}

export function useMember(id: string | undefined) {
    return useSWR(
        id ? CACHE_KEYS.MEMBER(id) : null,
        () => membersApi.get(id!),
        swrConfig
    );
}

// =============================================================================
// Subscriptions Hook
// =============================================================================
export function useSubscriptions(filters?: { groupId?: string; memberId?: string }) {
    return useSWR(
        CACHE_KEYS.SUBSCRIPTIONS(filters),
        () => subscriptionsApi.list(filters),
        swrConfig
    );
}

// =============================================================================
// Collections Hook
// =============================================================================
export function useCollections(filters?: { groupId?: string; memberId?: string; groupMemberId?: string }) {
    return useSWR(
        CACHE_KEYS.COLLECTIONS(filters),
        () => collectionsApi.list(filters),
        swrConfig
    );
}

// =============================================================================
// Winners Hook
// =============================================================================
export function useWinners(filters?: { groupId?: string }) {
    return useSWR(
        CACHE_KEYS.WINNERS(filters),
        () => winnersApi.list(filters),
        swrConfig
    );
}

// =============================================================================
// Reports Hook
// =============================================================================
export function useReports() {
    return useSWR(
        CACHE_KEYS.REPORTS,
        () => reportsApi.get(),
        swrConfig
    );
}

// =============================================================================
// Cache Invalidation Helpers
// =============================================================================

/**
 * Invalidate dashboard and related caches after a collection is created
 */
export async function invalidateAfterCollectionCreate(groupId?: string) {
    await Promise.all([
        globalMutate(CACHE_KEYS.DASHBOARD),
        globalMutate(CACHE_KEYS.COLLECTIONS()),
        groupId && globalMutate(CACHE_KEYS.GROUP(groupId)),
        groupId && globalMutate(CACHE_KEYS.SUBSCRIPTIONS({ groupId })),
    ]);
}

/**
 * Invalidate caches after a member is created
 */
export async function invalidateAfterMemberCreate() {
    await Promise.all([
        globalMutate(CACHE_KEYS.MEMBERS),
        globalMutate(CACHE_KEYS.DASHBOARD),
    ]);
}

/**
 * Invalidate caches after a group is created or updated
 */
export async function invalidateAfterGroupMutation(groupId?: string) {
    await Promise.all([
        globalMutate(CACHE_KEYS.GROUPS),
        groupId && globalMutate(CACHE_KEYS.GROUP(groupId)),
        globalMutate(CACHE_KEYS.DASHBOARD),
    ]);
}

/**
 * Invalidate caches after a winner is created
 */
export async function invalidateAfterWinnerCreate(groupId?: string) {
    await Promise.all([
        globalMutate(CACHE_KEYS.WINNERS()),
        groupId && globalMutate(CACHE_KEYS.WINNERS({ groupId })),
        groupId && globalMutate(CACHE_KEYS.GROUP(groupId)),
        globalMutate(CACHE_KEYS.DASHBOARD),
    ]);
}

/**
 * Invalidate caches after a subscription (group member) is created
 */
export async function invalidateAfterSubscriptionCreate(groupId?: string) {
    await Promise.all([
        globalMutate(CACHE_KEYS.SUBSCRIPTIONS()),
        groupId && globalMutate(CACHE_KEYS.SUBSCRIPTIONS({ groupId })),
        groupId && globalMutate(CACHE_KEYS.GROUP(groupId)),
        globalMutate(CACHE_KEYS.DASHBOARD),
    ]);
}

/**
 * Invalidate all caches (useful for logout or major state changes)
 */
export async function invalidateAllCaches() {
    await globalMutate(() => true, undefined, { revalidate: false });
}
