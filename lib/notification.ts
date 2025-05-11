import { getTasks } from "./tasks"
import { sendTaskReminders } from "./subscribers"

// Fungsi yang diperbarui untuk mendaftarkan service worker
export async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      // Hapus registrasi service worker yang ada terlebih dahulu untuk memastikan kita mendapatkan versi terbaru
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        await registration.unregister()
        console.log("Service worker unregistered:", registration)
      }

      // Daftarkan service worker baru
      console.log("Registering service worker...")
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      })
      console.log("Service worker registered successfully:", registration)

      // Tunggu service worker aktif
      if (registration.installing) {
        console.log("Service worker installing...")
        const sw = registration.installing || registration.waiting
        sw.addEventListener("statechange", (e) => {
          console.log("Service worker state changed:", sw.state)
        })
      }

      // Pastikan service worker sudah aktif sebelum mengembalikannya
      await navigator.serviceWorker.ready
      console.log("Service worker is ready")

      return registration
    } catch (error) {
      console.error("Service worker registration failed:", error)
      throw error
    }
  } else {
    throw new Error("Service workers are not supported in this browser")
  }
}

// Fungsi untuk menampilkan notifikasi langsung
export async function showNotification(title: string, options: NotificationOptions = {}) {
  try {
    // Periksa apakah browser mendukung notifikasi
    if (!("Notification" in window)) {
      console.error("This browser does not support desktop notification")
      return false
    }

    // Periksa izin notifikasi
    if (Notification.permission !== "granted") {
      console.error("Notification permission not granted")
      return false
    }

    // Coba tampilkan notifikasi menggunakan service worker jika tersedia
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      const registration = await navigator.serviceWorker.ready
      console.log("Showing notification via service worker")
      await registration.showNotification(title, {
        icon: "/notification-icon.png",
        badge: "/notification-icon.png",
        vibrate: [100, 50, 100],
        ...options,
      })
      return true
    } else {
      // Fallback ke notifikasi standar jika service worker tidak tersedia
      console.log("Showing notification via standard API")
      new Notification(title, {
        icon: "/notification-icon.png",
        ...options,
      })
      return true
    }
  } catch (error) {
    console.error("Error showing notification:", error)
    return false
  }
}

export interface ScheduledNotification {
  id: string
  title: string
  body: string
  scheduledTime: number
}

export function checkNotifications() {
  if (typeof window === "undefined") return

  // Check for scheduled notifications
  const now = new Date().getTime()
  const scheduledNotifications: ScheduledNotification[] = JSON.parse(
    localStorage.getItem("scheduledNotifications") || "[]",
  )

  const dueNotifications = scheduledNotifications.filter((notification) => notification.scheduledTime <= now)

  const remainingNotifications = scheduledNotifications.filter((notification) => notification.scheduledTime > now)

  // Update storage with remaining notifications
  localStorage.setItem("scheduledNotifications", JSON.stringify(remainingNotifications))

  // Send due notifications
  if (Notification.permission === "granted") {
    dueNotifications.forEach((notification) => {
      showNotification(notification.title, {
        body: notification.body,
      })
    })
  }
}

export async function scheduleTaskReminders() {
  if (typeof window === "undefined") return

  try {
    // Ambil semua tugas
    const tasks = await getTasks()

    // Ambil notifikasi yang sudah dijadwalkan
    const scheduledNotifications: ScheduledNotification[] = JSON.parse(
      localStorage.getItem("scheduledNotifications") || "[]",
    )

    // Filter tugas yang jatuh tempo besok (H-1)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

    const tasksForTomorrow = tasks.filter((task) => {
      const dueDate = new Date(task.due_date)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate.getTime() === tomorrow.getTime()
    })

    // Jadwalkan notifikasi untuk tugas besok jika belum ada
    const newNotifications: ScheduledNotification[] = []

    tasksForTomorrow.forEach((task) => {
      // Periksa apakah notifikasi untuk tugas ini sudah ada
      const notificationExists = scheduledNotifications.some(
        (notification) => notification.id === `reminder-${task.id}`,
      )

      if (!notificationExists) {
        // Jadwalkan notifikasi untuk jam 7 pagi
        const notificationTime = new Date()
        notificationTime.setDate(notificationTime.getDate())
        notificationTime.setHours(7, 0, 0, 0)

        newNotifications.push({
          id: `reminder-${task.id}`,
          title: "Pengingat Tugas",
          body: `Tugas "${task.title}" (${task.subject}) jatuh tempo besok!`,
          scheduledTime: notificationTime.getTime(),
        })
      }
    })

    // Tambahkan notifikasi baru ke daftar yang sudah ada
    if (newNotifications.length > 0) {
      const updatedNotifications = [...scheduledNotifications, ...newNotifications]
      localStorage.setItem("scheduledNotifications", JSON.stringify(updatedNotifications))

      console.log(`${newNotifications.length} notifikasi baru dijadwalkan`)
    }

    // Periksa notifikasi yang sudah waktunya ditampilkan
    checkNotifications()

    // Kirim notifikasi email untuk tugas H-1
    // Periksa apakah sudah mengirim email hari ini
    const lastEmailCheck = localStorage.getItem("lastEmailReminderCheck")
    const today = new Date().toDateString()

    if (lastEmailCheck !== today && tasksForTomorrow.length > 0) {
      // Kirim email pengingat
      await sendTaskReminders()

      // Simpan tanggal pengiriman terakhir
      localStorage.setItem("lastEmailReminderCheck", today)
    }
  } catch (error) {
    console.error("Error scheduling task reminders:", error)
  }
}
