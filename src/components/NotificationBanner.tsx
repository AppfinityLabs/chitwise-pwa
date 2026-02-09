'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Download, CheckCircle } from 'lucide-react';
import {
    isPushSupported,
    isIOSDevice,
    isInstalledPWA,
    getNotificationPermission,
    subscribeToPush,
    isPushSubscribed
} from '@/lib/pushUtils';

export default function NotificationBanner() {
    const [showBanner, setShowBanner] = useState(false);
    const [showIOSInstall, setShowIOSInstall] = useState(false);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        checkNotificationStatus();
    }, []);

    const checkNotificationStatus = async () => {
        // Check if already dismissed
        const dismissed = localStorage.getItem('notificationBannerDismissed');
        if (dismissed) return;

        // Check support
        if (!isPushSupported()) return;

        // iOS specific: show install prompt if not installed
        if (isIOSDevice() && !isInstalledPWA()) {
            setShowIOSInstall(true);
            setShowBanner(true);
            return;
        }

        // Check current permission and subscription
        const permission = getNotificationPermission();
        if (permission === 'granted') {
            const subscribed = await isPushSubscribed();
            setIsSubscribed(subscribed);
            if (!subscribed) {
                setShowBanner(true);
            }
            return;
        }

        if (permission === 'default') {
            setShowBanner(true);
        }
    };

    const handleEnableNotifications = async () => {
        setIsSubscribing(true);
        try {
            const subscription = await subscribeToPush();
            if (subscription) {
                setIsSubscribed(true);
                setShowBanner(false);
            }
        } catch (error) {
            console.error('Failed to subscribe:', error);
        } finally {
            setIsSubscribing(false);
        }
    };

    const handleDismiss = () => {
        setShowBanner(false);
        localStorage.setItem('notificationBannerDismissed', 'true');
    };

    if (!showBanner) return null;

    // iOS Install Banner
    if (showIOSInstall) {
        return (
            <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-lg animate-slide-down">
                <div className="max-w-md mx-auto flex items-start gap-3">
                    <Download className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-sm">Install ChitWise App</h3>
                        <p className="text-xs text-indigo-100 mt-1">
                            To receive notifications on iOS:
                        </p>
                        <ol className="text-xs text-indigo-100 mt-2 space-y-1 list-decimal list-inside">
                            <li>Tap the Share button (⬆️)</li>
                            <li>Select &quot;Add to Home Screen&quot;</li>
                            <li>Open from your home screen</li>
                        </ol>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    // Regular Notification Banner
    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-lg animate-slide-down">
            <div className="max-w-md mx-auto flex items-center gap-3">
                <Bell className="w-6 h-6 flex-shrink-0" />
                <div className="flex-1">
                    <h3 className="font-semibold text-sm">Stay Updated</h3>
                    <p className="text-xs text-indigo-100">
                        Get notified when collections are recorded
                    </p>
                </div>
                <button
                    onClick={handleEnableNotifications}
                    disabled={isSubscribing}
                    className="px-3 py-1.5 bg-white text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                    {isSubscribing ? (
                        <>
                            <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            <span>...</span>
                        </>
                    ) : isSubscribed ? (
                        <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Enabled</span>
                        </>
                    ) : (
                        'Enable'
                    )}
                </button>
                <button
                    onClick={handleDismiss}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
