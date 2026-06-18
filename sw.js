const CACHE_NAME = "ks-pro-v3";

// Önbelleğe alınacak kritik dosyalar
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json"
];

// Service Worker Kurulumu (Dosyaları Önbelleğe Alma)
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Eski Önbellekleri Temizleme (Versiyon Güncellendiğinde)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Çevrimdışı Çalışma Desteği (Fetch Yakalama)
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Eğer önbellekte varsa oradan getir, yoksa internetten çek
        return response || fetch(event.request);
      })
  );
});

// Arka Plandan Bildirime Tıklandığında Uygulamayı Açma
self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow("./");
    })
  );
});