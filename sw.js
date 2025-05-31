// Service Worker for Hola Japón
// Performance optimization and offline capabilities

const CACHE_NAME = 'hola-japon-v1.0.0';
const STATIC_CACHE = 'hola-japon-static-v1';
const DYNAMIC_CACHE = 'hola-japon-dynamic-v1';
const IMAGE_CACHE = 'hola-japon-images-v1';

// Files to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/about.html',
    '/contact.html',
    '/testimonials.html',
    '/css/style.css',
    '/css/performance.css',
    '/js/main.js',
    '/js/utilities.js',
    '/js/components.js',
    '/js/search.js',
    '/js/cart.js',
    '/data/data.json',
    '/data/products.json',
    '/manifest.json'
];

// Network-first resources
const NETWORK_FIRST = [
    '/data/',
    '/api/'
];

// Cache-first resources
const CACHE_FIRST = [
    '/assets/images/',
    '/css/',
    '/js/'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Service Worker: Static assets cached');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Error caching static assets', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && 
                            cacheName !== DYNAMIC_CACHE && 
                            cacheName !== IMAGE_CACHE) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);
    
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip external requests
    if (!requestUrl.origin.includes(self.location.origin)) {
        return;
    }
    
    event.respondWith(handleRequest(event.request));
});

// Handle different types of requests
async function handleRequest(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    try {
        // Images - Cache First with fallback
        if (pathname.includes('/assets/images/')) {
            return await cacheFirstStrategy(request, IMAGE_CACHE);
        }
        
        // Static assets - Cache First
        if (isStaticAsset(pathname)) {
            return await cacheFirstStrategy(request, STATIC_CACHE);
        }
        
        // Data - Network First with cache fallback
        if (pathname.includes('/data/')) {
            return await networkFirstStrategy(request, DYNAMIC_CACHE);
        }
        
        // HTML pages - Network First with cache fallback
        if (pathname.endsWith('.html') || pathname === '/') {
            return await networkFirstStrategy(request, DYNAMIC_CACHE);
        }
        
        // Default: Network only
        return await fetch(request);
        
    } catch (error) {
        console.error('Service Worker: Request failed', error);
        return await handleOfflineRequest(request);
    }
}

// Cache First Strategy
async function cacheFirstStrategy(request, cacheName) {
    try {
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            // Update cache in background
            updateCacheInBackground(request, cacheName);
            return cachedResponse;
        }
        
        // Not in cache, fetch and cache
        const networkResponse = await fetch(request);
        await cacheResponse(request, networkResponse.clone(), cacheName);
        return networkResponse;
        
    } catch (error) {
        // Network failed, try cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// Network First Strategy
async function networkFirstStrategy(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            await cacheResponse(request, networkResponse.clone(), cacheName);
        }
        
        return networkResponse;
        
    } catch (error) {
        // Network failed, try cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// Cache response helper
async function cacheResponse(request, response, cacheName) {
    try {
        const cache = await caches.open(cacheName);
        await cache.put(request, response);
    } catch (error) {
        console.error('Service Worker: Error caching response', error);
    }
}

// Update cache in background
function updateCacheInBackground(request, cacheName) {
    fetch(request)
        .then(response => {
            if (response.ok) {
                return cacheResponse(request, response, cacheName);
            }
        })
        .catch(error => {
            console.log('Service Worker: Background update failed', error);
        });
}

// Check if request is for static asset
function isStaticAsset(pathname) {
    const staticExtensions = ['.css', '.js', '.woff', '.woff2', '.ttf', '.eot'];
    return staticExtensions.some(ext => pathname.endsWith(ext));
}

// Handle offline requests
async function handleOfflineRequest(request) {
    const url = new URL(request.url);
    
    // For HTML pages, return cached page or offline page
    if (request.headers.get('Accept').includes('text/html')) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page if available
        const offlinePage = await caches.match('/offline.html');
        if (offlinePage) {
            return offlinePage;
        }
    }
    
    // For images, return placeholder
    if (request.headers.get('Accept').includes('image/')) {
        const placeholder = await caches.match('/assets/images/ui/placeholder.jpg');
        if (placeholder) {
            return placeholder;
        }
    }
    
    // Return generic offline response
    return new Response(
        JSON.stringify({
            error: 'Offline',
            message: 'Esta página no está disponible sin conexión'
        }),
        {
            status: 503,
            statusText: 'Service Unavailable',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
}

// Background sync for form submissions
self.addEventListener('sync', event => {
    console.log('Service Worker: Background sync triggered', event.tag);
    
    if (event.tag === 'contact-form-sync') {
        event.waitUntil(syncContactForms());
    }
    
    if (event.tag === 'cart-sync') {
        event.waitUntil(syncCartData());
    }
});

// Sync contact forms
async function syncContactForms() {
    try {
        const pendingForms = await getPendingForms();
        
        for (const form of pendingForms) {
            try {
                await submitContactForm(form);
                await removePendingForm(form.id);
                console.log('Service Worker: Contact form synced', form.id);
            } catch (error) {
                console.error('Service Worker: Failed to sync contact form', error);
            }
        }
    } catch (error) {
        console.error('Service Worker: Error syncing contact forms', error);
    }
}

// Sync cart data
async function syncCartData() {
    try {
        // Implementation for cart sync
        console.log('Service Worker: Cart data synced');
    } catch (error) {
        console.error('Service Worker: Error syncing cart data', error);
    }
}

// Helper functions for background sync
async function getPendingForms() {
    // Implementation to get pending forms from IndexedDB
    return [];
}

async function removePendingForm(id) {
    // Implementation to remove form from IndexedDB
}

async function submitContactForm(formData) {
    // Implementation to submit form to server
}

// Push notification handling
self.addEventListener('push', event => {
    console.log('Service Worker: Push notification received');
    
    if (!event.data) {
        return;
    }
    
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/assets/images/ui/icon-192.png',
        badge: '/assets/images/ui/badge-72.png',
        tag: data.tag || 'hola-japon-notification',
        requireInteraction: false,
        actions: [
            {
                action: 'view',
                title: 'Ver',
                icon: '/assets/images/ui/view-icon.png'
            },
            {
                action: 'dismiss',
                title: 'Cerrar',
                icon: '/assets/images/ui/close-icon.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification clicked', event.action);
    
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow(event.notification.data?.url || '/')
        );
    }
});

// Performance monitoring
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'PERFORMANCE_MEASURE') {
        console.log('Service Worker: Performance data received', event.data);
        // Send performance data to analytics
    }
});

console.log('Service Worker: Script loaded');