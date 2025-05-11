// Service Worker for PWA and notifications
const CACHE_NAME = "task-manager-v2" // Perbarui versi cache

// Files to cache
const urlsToCache = ["/", "/add-task", "/enable-notifications", "/subscribe", "/notification-icon.png"]

// Install event - cache assets
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...")
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker caching files...")
      return cache.addAll(urlsToCache)
    }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME
          })
          .map((cacheName) => {
            console.log("Service Worker removing old cache:", cacheName)
            return caches.delete(cacheName)
          }),
      )
    }),
  )
})

// Fetch event - serve from cache if available
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }
      return fetch(event.request)
    }),
  )
})

// Push notification event
self.addEventListener("push", (event) => {
  console.log("Push notification received:", event)
  let data = {}
  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      data = {
        title: "Notifikasi Tugas",
        body: event.data.text(),
      }
    }
  }

  const options = {
    body: data.body || "Ada tugas yang perlu diperhatikan!",
    icon: "/notification-icon.png",
    badge: "/notification-icon.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/",
    },
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "Notifikasi Tugas", options).then(() => {
      console.log("Notification shown successfully")
    }),
  )
})

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event)
  event.notification.close()

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      const url = event.notification.data.url || "/"

      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === url && "focus" in client) {
          return client.focus()
        }
      }

      // If no window/tab is already open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    }),
  )
})
