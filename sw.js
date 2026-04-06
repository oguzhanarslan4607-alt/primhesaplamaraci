// Uygulamanızın versiyonu. Her güncellemede bu rakamı değiştirin! (Örn: v1.2, v1.3, v2.0)
const CACHE_NAME = 'primpro-store-v1.2'; 

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// 1. Kurulum Aşaması (Dosyaları Cihaza Kaydet)
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Yeni versiyonu beklemeden hemen kurmaya başla
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Aktifleştirme Aşaması (Eski Versiyonları Sil)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        // Eğer cihazdaki cache ismi mevcut versiyonla eşleşmiyorsa, eskiyi sil
        if (key !== CACHE_NAME) {
          console.log('Eski önbellek siliniyor:', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim(); // Yeni service worker'ı anında tüm sayfalarda aktif et
});

// 3. Ağ İsteklerini Yakalama (Çevrimdışı Çalışma Desteği)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
       // Önce cihazdaki kayıtlı dosyaya bak, yoksa internetten indir
       return response || fetch(e.request).catch(() => caches.match('/index.html'));
    })
  );
});
