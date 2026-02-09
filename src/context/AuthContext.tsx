'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

interface User {
    _id: string;
    email: string;
    name: string;
    role: string;
    organisationId?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const userData = await authApi.me();
            setUser(userData);
        } catch {
            setUser(null);
            localStorage.removeItem('token'); // Clear invalid token
            if (pathname !== '/login') {
                router.replace('/login');
            }
        } finally {
            setLoading(false);
        }
    }

    async function login(email: string, password: string) {
        const response = await authApi.login(email, password);
        if (response.token) {
            localStorage.setItem('token', response.token);
        }
        setUser(response.user);
        router.replace('/');
    }

    async function logout() {
        try {
            await authApi.logout();
        } finally {
            setUser(null);
            localStorage.removeItem('token');
            router.replace('/login');
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
