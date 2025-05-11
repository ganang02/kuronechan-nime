// Service Worker for PWA and notifications
const CACHE_NAME = "task-manager-v3" // Perbarui versi cache

// Files to cache
const urlsToCache = ["/", "/add-task", "/enable-notifications", "/subscribe", "/notification-icon.png"]

// Log untuk debugging
function logMessage(message) {
  console.log(`[Service Worker] ${message}`)
}

// Install event - cache assets
self.addEventListener("install", (event) => {
  logMessage("Installing...")

  // Force the waiting service worker to become the active service worker
  self.skipWaiting()

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      logMessage("Caching files...")
      return cache.addAll(urlsToCache)
    }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  logMessage("Activating...")

  // Take control of all clients as soon as the service worker activates
  event.waitUntil(clients.claim())

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME
          })
          .map((cacheName) => {
            logMessage(`Removing old cache: ${cacheName}`)
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
  logMessage(`Push notification received: ${event.data ? event.data.text() : "No data"}`)

  let data = {}
  if (event.data) {
    try {
      data = event.data.json()
      logMessage(`Parsed push data: ${JSON.stringify(data)}`)
    } catch (e) {
      logMessage(`Error parsing push data: ${e}`)
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

  logMessage(`Showing notification: ${data.title || "Notifikasi Tugas"}`)

  event.waitUntil(
    self.registration
      .showNotification(data.title || "Notifikasi Tugas", options)
      .then(() => logMessage("Notification shown successfully"))
      .catch((err) => logMessage(`Error showing notification: ${err}`)),
  )
})

// Notification click event
self.addEventListener("notificationclick", (event) => {
  logMessage(`Notification clicked: ${event.notification.title}`)
  event.notification.close()

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      const url = event.notification.data.url || "/"
      logMessage(`Opening URL: ${url}`)

      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === url && "focus" in client) {
          logMessage("Focusing existing client")
          return client.focus()
        }
      }

      // If no window/tab is already open, open a new one
      if (clients.openWindow) {
        logMessage("Opening new window")
        return clients.openWindow(url)
      }
    }),
  )
})

// Listen for messages from the client
self.addEventListener("message", (event) => {
  logMessage(`Received message: ${JSON.stringify(event.data)}`)

  if (event.data && event.data.type === "PING") {
    // Send a response back to the client
    event.ports[0].postMessage({
      type: "PONG",
      status: "Service worker is active and responding",
    })
  }

  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, options } = event.data
    logMessage(`Showing notification from client message: ${title}`)

    self.registration
      .showNotification(title, options || {})
      .then(() => {
        logMessage("Notification shown successfully from client message")
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ success: true })
        }
      })
      .catch((err) => {
        logMessage(`Error showing notification from client message: ${err}`)
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ success: false, error: err.message })
        }
      })
  }
})

// Log when the service worker is ready
logMessage("Service worker initialized")
