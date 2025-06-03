const CACHE_NAME = 'hola-japon-v1.0.0';
const STATIC_CACHE = 'hola-japon-static-v1';
const DYNAMIC_CACHE = 'hola-japon-dynamic-v1';

// キャッシュするファイル
const STATIC_FILES = [
  '/',
  '/index.html',
  '/products.html',
  '/blog.html',
  '/about.html',
  '/contact.html',
  '/css/style.css',
  '/js/main.js',
  '/js/core.js',
  '/js/features.js',
  '/js/products.js',
  '/js/blog.js',
  '/data/data.json',
  '/manifest.json',
  '/favicon.ico',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// インストールイベント
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('[SW] Static files cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Failed to cache static files:', error);
      })
  );
});

// アクティベーションイベント
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated');
        return self.clients.claim();
      })
  );
});

// フェッチイベント
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // chrome-extension、moz-extension、safari-extension スキームやその他の非HTTPスキームをスキップ
  if (!url.protocol.startsWith('http')) {
    // 開発者ツールでのログを減らすため、chrome-extensionは静かにスキップ
    if (!url.protocol.startsWith('chrome-extension')) {
      console.log('[SW] Skipping non-HTTP request:', url.protocol);
    }
    return;
  }

  // ブラウザ拡張機能のリクエストをスキップ
  if (url.hostname.includes('extension') || url.hostname.includes('moz-extension')) {
    return;
  }

  // ナビゲーションリクエストの場合
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // 動的キャッシュに保存
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then(cache => cache.put(request, responseClone))
            .catch(error => console.warn('[SW] Failed to cache navigation:', error));
          return response;
        })
        .catch(() => {
          // オフライン時はキャッシュから返す
          return caches.match(request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // フォールバック用のオフラインページ
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }

  // 静的ファイルの場合
  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'font') {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then(response => {
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(STATIC_CACHE)
                  .then(cache => cache.put(request, responseClone))
                  .catch(error => console.warn('[SW] Failed to cache static file:', error));
              }
              return response;
            })
            .catch(error => {
              console.warn('[SW] Failed to fetch static file:', error);
              return new Response('', { status: 404 });
            });
        })
    );
    return;
  }

  // 画像の場合
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then(response => {
              // 画像は動的キャッシュに保存（サイズ制限あり）
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE)
                  .then(cache => {
                    // キャッシュサイズを制限
                    limitCacheSize(DYNAMIC_CACHE, 100);
                    return cache.put(request, responseClone);
                  })
                  .catch(error => console.warn('[SW] Failed to cache image:', error));
              }
              return response;
            })
            .catch(() => {
              // オフライン時の代替画像
              return caches.match('/assets/images/ui/offline-image.png')
                .then(fallback => fallback || new Response('', { status: 404 }));
            });
        })
    );
    return;
  }

  // APIリクエストの場合
  if (url.pathname.includes('/api/') || url.pathname.includes('/data/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => cache.put(request, responseClone))
              .catch(error => console.warn('[SW] Failed to cache API response:', error));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // その他のリクエスト
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        return cachedResponse || fetch(request).catch(() => new Response('', { status: 404 }));
      })
  );
});

// キャッシュサイズを制限する関数
function limitCacheSize(cacheName, maxItems) {
  caches.open(cacheName)
    .then(cache => {
      cache.keys()
        .then(keys => {
          if (keys.length > maxItems) {
            cache.delete(keys[0])
              .then(() => limitCacheSize(cacheName, maxItems));
          }
        });
    });
}

// バックグラウンド同期
self.addEventListener('sync', event => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'cart-sync') {
    event.waitUntil(syncCart());
  }
  
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(syncContactForms());
  }
});

// カート同期
async function syncCart() {
  try {
    const cartData = await getStoredCartData();
    if (cartData && cartData.length > 0) {
      await fetch('/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cartData)
      });
      // 同期成功後、ローカルデータをクリア
      await clearStoredCartData();
    }
  } catch (error) {
    console.error('[SW] Cart sync failed:', error);
    throw error;
  }
}

// お問い合わせフォーム同期
async function syncContactForms() {
  try {
    const forms = await getStoredContactForms();
    for (const form of forms) {
      await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      });
    }
    await clearStoredContactForms();
  } catch (error) {
    console.error('[SW] Contact form sync failed:', error);
    throw error;
  }
}

// プッシュ通知
self.addEventListener('push', event => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva actualización disponible',
    icon: '/assets/images/ui/icon-192x192.png',
    badge: '/assets/images/ui/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver ahora',
        icon: '/assets/images/ui/action-explore.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/assets/images/ui/action-close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('¡Hola Japón!', options)
  );
});

// 通知クリックイベント
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // 何もしない（通知を閉じるだけ）
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// メッセージイベント（メインスレッドからの通信）
self.addEventListener('message', event => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// ヘルパー関数
async function getStoredCartData() {
  // IndexedDB からカートデータを取得
  return new Promise((resolve) => {
    // 実装は省略（IndexedDBアクセス）
    resolve([]);
  });
}

async function clearStoredCartData() {
  // IndexedDB からカートデータを削除
  return new Promise((resolve) => {
    resolve();
  });
}

async function getStoredContactForms() {
  // IndexedDB からフォームデータを取得
  return new Promise((resolve) => {
    resolve([]);
  });
}

async function clearStoredContactForms() {
  // IndexedDB からフォームデータを削除
  return new Promise((resolve) => {
    resolve();
  });
}