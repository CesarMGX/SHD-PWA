const CACHE_NAME = 'edu-recorder-v9';

const APP_SHELL = [
    './',
    './index.html',
    './css/style.css',
    './css/animate.css',
    './js/app.js',
    './js/libs/jquery.js',
    './manifest.json',
    './img/gorrito.png',
    './img/icons/icon-72x72.png',
    './img/icons/icon-96x96.png',
    './img/icons/icon-128x128.png',
    './img/icons/icon-144x144.png',
    './img/icons/icon-152x152.png',
    './img/icons/icon-192x192.png',
    './img/icons/icon-384x384.png',
    './img/icons/icon-512x512.png',
    'https://fonts.googleapis.com/css?family=Lato:400,700|Quicksand:600,700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css'
];

// Instalar Service Worker y guardar App Shell en Caché
self.addEventListener('install', (e) => {
    const cache = caches.open(CACHE_NAME).then((c) => c.addAll(APP_SHELL));
    e.waitUntil(cache);
    self.skipWaiting();
});

// Activar y eliminar la versión anterior de la caché automáticamente
self.addEventListener('activate', (e) => {
    const activate = caches.keys().then((keys) => {
        return Promise.all(keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        );
    });
    e.waitUntil(activate);
    self.clients.claim();
});

// Estrategia de Caché: Cache First con Network Fallback
self.addEventListener('fetch', (e) => {
    const respuesta = caches.match(e.request).then((cacheResp) => {
        if (cacheResp) {
            return cacheResp;
        }
        return fetch(e.request).then((netResp) => {
            if (e.request.method === 'GET' && netResp.ok) {
                const copia = netResp.clone();
                caches.open(CACHE_NAME).then((c) => c.put(e.request, copia));
            }
            return netResp;
        }).catch(() => {
            if (e.request.mode === 'navigate') {
                return caches.match('./index.html');
            }
        });
    });

    e.respondWith(respuesta);
});

// Evento de Notificaciones Push o Locales
self.addEventListener('push', (e) => {
    let datos = { title: 'Edu-Recorder', body: 'Tienes un nuevo pendiente escolar.' };

    if (e.data) {
        datos = e.data.json();
    }

    const opciones = {
        body: datos.body,
        icon: './img/icons/icon-192x192.png',
        badge: './img/icons/icon-72x72.png'
    };

    e.waitUntil(self.registration.showNotification(datos.title, opciones));
});

// Click en la Notificación
self.addEventListener('notificationclick', (e) => {
    e.notification.close();
    e.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes('index.html') && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('./index.html');
            }
        })
    );
});
