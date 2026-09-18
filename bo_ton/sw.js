// Service Worker cho Ứng dụng PWA Tra Cứu TCVN & QCVN
const CACHE_NAME = 'tcvn-cache-v38';

// Danh mục tài nguyên cốt lõi bắt buộc để chạy Offline
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  'https://cdn-icons-png.flaticon.com/512/3135/3135768.png'
];

// Cài đặt Service Worker và nạp cache tài nguyên cơ sở
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Kích hoạt SW và tự động dọn sạch cache phiên bản cũ
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Bắt sự kiện tải: Ưu tiên Cache -> Tải mạng -> Tự động lưu cache file ảnh mới
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Tự động lưu cache hình ảnh và tài nguyên phát sinh khi tải thành công
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      return caches.match('./index.html');
    })
  );
});