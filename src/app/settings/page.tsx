'use client';

import { useAuth } from '@/context/AuthContext';
import { usePush } from '@/context/PushContext';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Bell,
    Moon,
    Globe,
    HelpCircle,
    Shield,
    ChevronRight,
    Smartphone,
    Lock
} from 'lucide-react';
import Link from 'next/link';

export default function ModernSettingsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const {
        isSupported,
        isSubscribed,
        permission,
        isLoading,
        isIOSDevice,
        isInstalled,
        showInstallPrompt,
        subscribe,
        unsubscribe,
    } = usePush();

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-24">

            {/* Header */}
            <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/5 text-zinc-400 transition-colors">
                    <ArrowLeft size={22} />
                </button>
                <h1 className="text-lg font-medium text-white">Settings</h1>
            </header>

            <main className="p-4 space-y-8 max-w-lg mx-auto">

                {/* Section 1: Preferences */}
                <section className="space-y-3">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-2">App Preferences</h3>
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">

                        {/* Dark Mode (Active Toggle Demo) */}
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                    <Moon size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-zinc-200">Dark Mode</p>
                                    <p className="text-xs text-zinc-500">System Default</p>
                                </div>
                            </div>
                            {/* Visual Toggle Switch */}
                            <div className="w-11 h-6 bg-indigo-600 rounded-full relative shadow-inner shadow-black/20">
                                <div className="absolute top-1 right-1 h-4 w-4 bg-white rounded-full shadow-sm" />
                            </div>
                        </div>

                        {/* Notifications */}
                        <NotificationToggle
                            isSupported={isSupported}
                            isSubscribed={isSubscribed}
                            permission={permission}
                            isLoading={isLoading}
                            isIOSDevice={isIOSDevice}
                            isInstalled={isInstalled}
                            showInstallPrompt={showInstallPrompt}
                            onToggle={async () => {
                                if (isSubscribed) {
                                    await unsubscribe();
                                } else {
                                    await subscribe();
                                }
                            }}
                        />

                        {/* Language */}
                        <SettingsItem
                            icon={Globe}
                            label="Language"
                            value="English"
                            isLink
                        />
                    </div>
                </section>

                {/* Section 2: Security & Support */}
                <section className="space-y-3">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-2">Security & Support</h3>
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">

                        <SettingsItem
                            icon={Shield}
                            label="Privacy & Security"
                            badge="Soon"
                        />
                        <SettingsItem
                            icon={HelpCircle}
                            label="Help & Support"
                            isLink
                        />
                    </div>
                </section>

                {/* Footer / Version Info */}
                <div className="flex flex-col items-center pt-8 space-y-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center shadow-2xl">
                        <Smartphone size={24} className="text-zinc-600" />
                    </div>
                    <div className="text-center space-y-1">
                        <p className="text-sm font-medium text-zinc-300">ChitWise Org</p>
                        <p className="text-xs text-zinc-600 font-mono">v1.0.0 (Build 2026.02)</p>
                    </div>
                    <p className="text-[10px] text-zinc-700 max-w-[200px] text-center">
                        © 2026 ChitWise Financial Technologies. All rights reserved.
                    </p>
                </div>
            </main>
        </div>
    );
}

// --- Reusable Settings Item Component ---
function SettingsItem({ icon: Icon, label, value, badge, isLink }: any) {
    const Content = (
        <div className={`flex items-center justify-between p-4 group ${isLink ? 'cursor-pointer hover:bg-white/5 transition-colors' : 'opacity-75'}`}>
            <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${badge ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-800 text-zinc-400 group-hover:text-zinc-200'
                    }`}>
                    <Icon size={18} />
                </div>
                <div>
                    <p className={`text-sm font-medium ${badge ? 'text-zinc-500' : 'text-zinc-300 group-hover:text-zinc-200'}`}>
                        {label}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {value && <span className="text-xs text-zinc-500">{value}</span>}

                {badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded border border-white/5">
                        {badge}
                    </span>
                )}

                {isLink && (
                    <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400" />
                )}
            </div>
        </div>
    );

    return Content;
}

// --- Notification Toggle Component ---
function NotificationToggle({
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    isIOSDevice,
    isInstalled,
    showInstallPrompt,
    onToggle,
}: {
    isSupported: boolean;
    isSubscribed: boolean;
    permission: NotificationPermission | 'unsupported';
    isLoading: boolean;
    isIOSDevice: boolean;
    isInstalled: boolean;
    showInstallPrompt: boolean;
    onToggle: () => void;
}) {
    // iOS not installed — show install instruction
    if (showInstallPrompt) {
        return (
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                        <Bell size={18} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-zinc-300">Notifications</p>
                        <p className="text-[11px] text-amber-400/80 leading-tight max-w-[200px]">
                            Install this app to Home Screen to enable notifications
                        </p>
                    </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                    Install
                </span>
            </div>
        );
    }

    // Permission denied
    if (permission === 'denied') {
        return (
            <div className="flex items-center justify-between p-4 opacity-60">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                        <Bell size={18} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-zinc-400">Notifications</p>
                        <p className="text-[11px] text-red-400/70 leading-tight max-w-[200px]">
                            Blocked — enable in browser settings
                        </p>
                    </div>
                </div>
                <Lock size={16} className="text-zinc-600" />
            </div>
        );
    }

    // Not supported
    if (!isSupported) {
        return (
            <div className="flex items-center justify-between p-4 opacity-50">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500">
                        <Bell size={18} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-zinc-500">Notifications</p>
                        <p className="text-[11px] text-zinc-600">Not supported in this browser</p>
                    </div>
                </div>
            </div>
        );
    }

    // Normal toggle
    return (
        <button
            onClick={onToggle}
            disabled={isLoading}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors disabled:opacity-50"
        >
            <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${isSubscribed ? 'bg-indigo-500/10 text-indigo-400' : 'bg-zinc-800 text-zinc-400'}`}>
                    <Bell size={18} />
                </div>
                <div className="text-left">
                    <p className={`text-sm font-medium ${isSubscribed ? 'text-zinc-200' : 'text-zinc-300'}`}>
                        Notifications
                    </p>
                    <p className="text-[11px] text-zinc-500">
                        {isLoading ? 'Processing...' : isSubscribed ? 'Push notifications enabled' : 'Tap to enable push notifications'}
                    </p>
                </div>
            </div>
            {/* Toggle Switch */}
            <div className={`w-11 h-6 rounded-full relative shadow-inner shadow-black/20 transition-colors ${isSubscribed ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                <div className={`absolute top-1 h-4 w-4 bg-white rounded-full shadow-sm transition-all ${isSubscribed ? 'right-1' : 'left-1'}`} />
            </div>
        </button>
    );
}