// eslint-disable-next-line
const logger = (...args) => console.log(args);

const DEBUG = false;
const global = this;
const FILES_TO_CACHE = [
    '../index.html',
    '../about.html',
    '../games.html',
    '../projects.html',
    '../offline.html',
    '../imgs/offline.png',
    '../imgs/neverwinter.jpg',
    '../imgs/Shadowverselogo.png',
    '../imgs/southpark.png',
    '../imgs/wow-logo.png',
    '../imgs/Cleric_devoted.png',
    '../imgs/job_profile.JPG',
    '../imgs/arrowTrans.png',
    '../imgs/lightSen.jpg',
    '../imgs/knob_BB.png',
    '../imgs/voltage_allowed.JPG',
    '../imgs/Environment_monitor.jpg',
    '../imgs/Car.JPG',
    '../imgs/Mesh.png',
    '../imgs/Cylinder.JPG',
    '../imgs/sprite.PNG',
    '../imgs/voice.jpg',
    '../vanilla.bundle.js',
    '../react.bundle.js',
    '../webapp/controller/App.controller.js',
    '../webapp/controller/BaseController.js',
    '../webapp/controller/Detail.controller.js',
    '../webapp/controller/ListSelector.js',
    '../webapp/controller/Master.controller.js',
    '../webapp/controller/SubDetail.controller.js',
    '../webapp/view/Detail.view.xml',
    '../webapp/view/Master.view.xml',
    '../webapp/style.css',
    '../vanilla.css',
    '../react.css',
    '../vids/Environment_monitorVidmp4.mp4',
    '../vids/BestMP4.mp4',
    '../vids/Vector_Scene_1_image_00121.webm',
    '../vids/Tic-Tac-Toe_Game.mp4'
];
const assets = FILES_TO_CACHE;
const CACHE_NAME = `olayenca.github.io_${new Date().toLocaleDateString()}`;

let assetsToCache = [...assets];

assetsToCache = assetsToCache.map(path => {
    return new URL(path, global.location).toString();
});

self.addEventListener('install', event => {
    if (DEBUG) {
        logger('[SW] Install event');
    }

    event.waitUntil(
        global.caches
            .open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(assetsToCache);
            })
            .then(() => {
                if (DEBUG) {
                    logger('Cached assets: main', assetsToCache);
                }
            })
            .catch(error => {
                console.error(error); // eslint-disable-line no-console
                throw error;
            })
    );
});

self.addEventListener('activate', event => {
    if (DEBUG) {
        logger('[SW] Activate event');
    }

    event.waitUntil(
        global.caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName.indexOf(CACHE_NAME) === 0) {
                        return null;
                    }

                    return global.caches.delete(cacheName);
                })
            );
        })
    );
});

self.addEventListener('message', event => {
    switch (event.data.action) {
        case 'skipWaiting':
            if (self.skipWaiting) {
                self.skipWaiting();
                self.clients.claim();
            }
            break;
        default:
            break;
    }
});

self.addEventListener('fetch', event => {
    const request = event.request;

    if (request.method !== 'GET') {
        if (DEBUG) {
            logger(`[SW] Ignore non GET request ${request.method}`);
        }
        return;
    }

    const requestUrl = new URL(request.url);

    if (requestUrl.origin !== location.origin) {
        if (DEBUG) {
            logger(`[SW] Ignore difference origin ${requestUrl.origin}`);
        }
        return;
    }

    const resource = global.caches.match(request).then(response => {
        if (response) {
            if (DEBUG) {
                logger(`[SW] fetch URL ${requestUrl.href} from cache`);
            }
            return response;
        }

        // Load and cache known assets.
        return fetch(request)
            .then(responseNetwork => {
                if (!responseNetwork || !responseNetwork.ok) {
                    if (DEBUG) {
                        logger(
                            `[SW] URL [${requestUrl.toString()}] wrong responseNetwork: ${
                                responseNetwork.status
                            } ${responseNetwork.type}`
                        );
                    }
                    return responseNetwork;
                }

                if (DEBUG) {
                    logger(`[SW] URL ${requestUrl.href} fetched`);
                }

                const responseCache = responseNetwork.clone();

                global.caches
                    .open(CACHE_NAME)
                    .then(cache => {
                        return cache.put(request, responseCache);
                    })
                    .then(() => {
                        if (DEBUG) {
                            logger(`[SW] Cache asset: ${requestUrl.href}`);
                        }
                    });

                return responseNetwork;
            })
            .catch(error => {
                logger(
                    `[onfetch] Failed. Serving cached offline fallback ${error}`
                );
                return global.caches.open(CACHE_NAME).then(function(cache) {
                    return cache.match('./offline.html');
                });
            });
    });
    event.respondWith(resource);
});
