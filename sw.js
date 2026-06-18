// Uygulamanızın versiyonu. Önbelleğin güncellenmesi için v5.1 yapıldı.
// Her yeni HTML/JS/CSS değişikliğinde bu rakamı değiştirin!
const CACHE_NAME = 'primpro-store-v6.0';

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
      console.log('Önbelleğe alınıyor: ', CACHE_NAME);
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
  const isPageRequest = e.request.mode === 'navigate' || e.request.destination === 'document';

  if (isPageRequest) {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
          return response;
        })
        .catch(() => caches.match(e.request).then((response) => response || caches.match('/index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((response) => {
       // Önce cihazdaki kayıtlı dosyaya bak, yoksa internetten indir
       // Hata durumunda (çevrimdışıysa ve dosya cache'de yoksa) index.html'e düş
       return response || fetch(e.request).catch(() => caches.match('/index.html'));
    })
  );
});
