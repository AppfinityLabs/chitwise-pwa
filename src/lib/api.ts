const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ApiOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
}

async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const config: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...headers,
        },
        credentials: 'include', // Include cookies for auth
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Something went wrong' }));
        throw new Error(error.error || error.message || 'API Error');
    }

    return response.json();
}

// Auth APIs
export const authApi = {
    login: (email: string, password: string) =>
        api<{ token: string; user: any }>('/api/auth/login', {
            method: 'POST',
            body: { email, password },
        }),
    logout: () => api('/api/auth/logout', { method: 'POST' }),
    me: () => api<any>('/api/auth/me'),
};

// Dashboard API
export const dashboardApi = {
    get: () =>
        api<{
            stats: {
                activeGroups: number;
                totalCollections: number;
                activeMembers: number;
                pendingDues: number;
            };
            recentCollections: any[];
            pendingDuesList: any[];
        }>('/api/dashboard'),
};

// Groups APIs
export const groupsApi = {
    list: () => api<any[]>('/api/chitgroups'),
    get: (id: string) => api<any>(`/api/chitgroups/${id}`),
    create: (data: any) => api<any>('/api/chitgroups', { method: 'POST', body: data }),
    update: (id: string, data: any) => api<any>(`/api/chitgroups/${id}`, { method: 'PUT', body: data }),
};

// Members APIs
export const membersApi = {
    list: () => api<any[]>('/api/members'),
    get: (id: string) => api<any>(`/api/members/${id}`),
    create: (data: any) => api<any>('/api/members', { method: 'POST', body: data }),
    update: (id: string, data: any) => api<any>(`/api/members/${id}`, { method: 'PUT', body: data }),
};

// Group Members (Subscriptions) APIs
export const subscriptionsApi = {
    list: (filters?: { groupId?: string; memberId?: string }) => {
        const params = new URLSearchParams();
        if (filters?.groupId) params.set('groupId', filters.groupId);
        if (filters?.memberId) params.set('memberId', filters.memberId);
        const query = params.toString() ? `?${params.toString()}` : '';
        return api<any[]>(`/api/groupmembers${query}`);
    },
    create: (data: any) => api<any>('/api/groupmembers', { method: 'POST', body: data }),
};

// Collections APIs
export const collectionsApi = {
    list: (filters?: { groupId?: string; memberId?: string; groupMemberId?: string }) => {
        const params = new URLSearchParams();
        if (filters?.groupId) params.set('groupId', filters.groupId);
        if (filters?.memberId) params.set('memberId', filters.memberId);
        if (filters?.groupMemberId) params.set('groupMemberId', filters.groupMemberId);
        const query = params.toString() ? `?${params.toString()}` : '';
        return api<any[]>(`/api/collections${query}`);
    },
    create: (data: any) => api<any>('/api/collections', { method: 'POST', body: data }),
};

// Winners APIs
export const winnersApi = {
    list: (filters?: { groupId?: string }) => {
        const params = new URLSearchParams();
        if (filters?.groupId) params.set('groupId', filters.groupId);
        const query = params.toString() ? `?${params.toString()}` : '';
        return api<any[]>(`/api/winners${query}`);
    },
    create: (data: any) => api<any>('/api/winners', { method: 'POST', body: data }),
};

// Reports API
export const reportsApi = {
    get: () =>
        api<{
            trends: any[];
            distribution: any[];
            paymentModeStats: any[];
            recentTransactions: any[];
            groupPerformance: any[];
        }>('/api/reports'),
};

export default api;
