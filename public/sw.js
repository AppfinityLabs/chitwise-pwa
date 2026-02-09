/// <reference lib="webworker" />
// SW v2 - image + priority support

// Push notification event - receives push from server
self.addEventListener('push', function (event) {
    if (!event.data) return;

    let data;
    try {
        data = event.data.json();
    } catch (e) {
        data = {
            title: 'ChitWise',
            body: event.data.text(),
        };
    }

    const options = {
        body: data.body || '',
        icon: data.icon || '/icons/icon-192.png',
        badge: data.badge || '/icons/icon-192.png',
        tag: data.tag || 'chitwise-notification',
        data: {
            url: data.url || '/',
            priority: data.priority || 'normal',
            ...data.data,
        },
        vibrate: data.priority === 'urgent' ? [300, 100, 300, 100, 300] : [200, 100, 200],
        requireInteraction: data.priority === 'urgent',
    };

    // Add image if provided (must be a valid URL, not undefined)
    if (data.image) {
        options.image = data.image;
    }

    options.actions = [
        {
            action: 'open',
            title: 'Open',
        },
        {
            action: 'dismiss',
            title: 'Dismiss',
        },
    ];

    event.waitUntil(
        self.registration.showNotification(data.title || 'ChitWise', options)
    );
});

// Notification click - open the app at the right URL
self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    if (event.action === 'dismiss') return;

    const targetUrl = event.notification.data?.url || '/';

    event.waitUntil(
        clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then(function (clientList) {
                // If the app is already open, focus it and navigate
                for (const client of clientList) {
                    if ('focus' in client) {
                        client.focus();
                        client.navigate(targetUrl);
                        return;
                    }
                }
                // Otherwise, open a new window
                return clients.openWindow(targetUrl);
            })
    );
});

// Handle subscription change (e.g., browser refreshes the subscription)
self.addEventListener('pushsubscriptionchange', function (event) {
    event.waitUntil(
        self.registration.pushManager
            .subscribe(event.oldSubscription.options)
            .then(function (subscription) {
                // Re-register with the server
                return fetch('/api/push/resubscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        oldEndpoint: event.oldSubscription.endpoint,
                        newSubscription: subscription.toJSON(),
                    }),
                });
            })
    );
});
