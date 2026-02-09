'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
    isPushSupported,
    isStandalone,
    isIOS,
    getPermissionState,
    registerServiceWorker,
    subscribeToPush,
    unsubscribeFromPush,
    isSubscribedToPush,
} from '@/lib/pushNotifications';

interface PushContextType {
    /** Whether the browser supports push notifications */
    isSupported: boolean;
    /** Whether the user has an active push subscription */
    isSubscribed: boolean;
    /** Current notification permission: 'default' | 'granted' | 'denied' | 'unsupported' */
    permission: NotificationPermission | 'unsupported';
    /** Whether a push operation is in progress */
    isLoading: boolean;
    /** Whether the app is installed as PWA (standalone) */
    isInstalled: boolean;
    /** Whether the user is on iOS */
    isIOSDevice: boolean;
    /** Whether to show the install prompt (iOS + not standalone) */
    showInstallPrompt: boolean;
    /** Subscribe to push notifications */
    subscribe: () => Promise<boolean>;
    /** Unsubscribe from push notifications */
    unsubscribe: () => Promise<boolean>;
    /** Dismiss the notification banner */
    dismissBanner: () => void;
    /** Whether the banner has been dismissed */
    bannerDismissed: boolean;
}

const PushContext = createContext<PushContextType | undefined>(undefined);

export function PushProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');
    const [isLoading, setIsLoading] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOSDevice, setIsIOSDevice] = useState(false);
    const [bannerDismissed, setBannerDismissed] = useState(false);

    // Initialize on mount
    useEffect(() => {
        const supported = isPushSupported();
        setIsSupported(supported);
        setIsInstalled(isStandalone());
        setIsIOSDevice(isIOS());
        setPermission(getPermissionState());

        // Check if banner was previously dismissed
        const dismissed = localStorage.getItem('push-banner-dismissed');
        if (dismissed) setBannerDismissed(true);

        // Register service worker
        if (supported) {
            registerServiceWorker();
        }
    }, []);

    // Check subscription status when user changes
    useEffect(() => {
        if (user && isSupported) {
            checkSubscription();
        } else {
            setIsSubscribed(false);
        }
    }, [user, isSupported]);

    // Auto-subscribe if permission was previously granted
    useEffect(() => {
        if (user && isSupported && permission === 'granted') {
            checkAndAutoSubscribe();
        }
    }, [user, isSupported, permission]);

    async function checkSubscription() {
        const subscribed = await isSubscribedToPush();
        setIsSubscribed(subscribed);
    }

    async function checkAndAutoSubscribe() {
        const subscribed = await isSubscribedToPush();
        if (!subscribed) {
            // Auto-resubscribe if permission was already granted
            await subscribeToPush();
            setIsSubscribed(await isSubscribedToPush());
        } else {
            setIsSubscribed(true);
        }
    }

    const subscribe = useCallback(async () => {
        setIsLoading(true);
        try {
            const subscription = await subscribeToPush();
            const success = subscription !== null;
            setIsSubscribed(success);
            setPermission(getPermissionState());
            return success;
        } catch (error) {
            console.error('Subscribe error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const unsubscribe = useCallback(async () => {
        setIsLoading(true);
        try {
            const success = await unsubscribeFromPush();
            if (success) setIsSubscribed(false);
            return success;
        } catch (error) {
            console.error('Unsubscribe error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const dismissBanner = useCallback(() => {
        setBannerDismissed(true);
        localStorage.setItem('push-banner-dismissed', 'true');
    }, []);

    const showInstallPrompt = isIOSDevice && !isInstalled;

    return (
        <PushContext.Provider
            value={{
                isSupported,
                isSubscribed,
                permission,
                isLoading,
                isInstalled,
                isIOSDevice,
                showInstallPrompt,
                subscribe,
                unsubscribe,
                dismissBanner,
                bannerDismissed,
            }}
        >
            {children}
        </PushContext.Provider>
    );
}

export function usePush() {
    const context = useContext(PushContext);
    if (context === undefined) {
        throw new Error('usePush must be used within a PushProvider');
    }
    return context;
}
