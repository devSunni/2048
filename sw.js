const CACHE_NAME = '2048-game-v1';
const urlsToCache = [
  '/2048/',
  '/2048/index.html',
  '/2048/style.css',
  '/2048/script.js',
  '/2048/favicon.svg',
  '/2048/manifest.json'
];

// 서비스 워커 설치
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// 서비스 워커 활성화
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 캐시에서 찾으면 반환
        if (response) {
          return response;
        }
        // 캐시에 없으면 네트워크에서 가져오기
        return fetch(event.request);
      }
    )
  );
}); 