const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_KEY || '';

/**
 * Convert a URL-safe base64 string to a Uint8Array for applicationServerKey
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Check if push notifications are supported in this browser
 */
export function isPushSupported(): boolean {
    return (
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window
    );
}

/**
 * Check if the app is running as an installed PWA (standalone mode)
 */
export function isStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
    );
}

/**
 * Detect if the user is on iOS
 */
export function isIOS(): boolean {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

/**
 * Get current notification permission state
 */
export function getPermissionState(): NotificationPermission | 'unsupported' {
    if (!isPushSupported()) return 'unsupported';
    return Notification.permission;
}

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) return null;

    try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
        });
        console.log('Service Worker registered:', registration.scope);
        return registration;
    } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
    }
}

/**
 * Subscribe the user to push notifications
 * 1. Request notification permission
 * 2. Subscribe to push via service worker
 * 3. Send subscription to backend
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
    if (!isPushSupported()) {
        console.warn('Push notifications not supported');
        return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        console.log('Notification permission denied');
        return null;
    }

    try {
        // Get service worker registration
        const registration = await navigator.serviceWorker.ready;

        // Check for existing subscription
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            // Subscribe with VAPID key
            const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
            });
        }

        // Send subscription to backend
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/push/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            credentials: 'include',
            body: JSON.stringify({
                subscription: subscription.toJSON(),
                userAgent: navigator.userAgent,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to save subscription on server');
        }

        console.log('Push subscription successful');
        return subscription;
    } catch (error) {
        console.error('Push subscription failed:', error);
        return null;
    }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (!subscription) return true;

        // Unsubscribe locally
        await subscription.unsubscribe();

        // Remove from backend
        const token = localStorage.getItem('token');
        await fetch(`${API_BASE_URL}/api/push/subscribe`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            credentials: 'include',
            body: JSON.stringify({
                endpoint: subscription.endpoint,
            }),
        });

        console.log('Push unsubscription successful');
        return true;
    } catch (error) {
        console.error('Push unsubscription failed:', error);
        return false;
    }
}

/**
 * Check if user is currently subscribed to push
 */
export async function isSubscribedToPush(): Promise<boolean> {
    if (!isPushSupported()) return false;

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        return subscription !== null;
    } catch {
        return false;
    }
}
