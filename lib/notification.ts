import { getTasks } from "./tasks"
import { sendTaskReminders } from "./subscribers"

export async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      })

      return registration
    } catch (error) {
      console.error("Service worker registration failed:", error)
      throw error
    }
  } else {
    throw new Error("Service workers are not supported in this browser")
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
      new Notification(notification.title, {
        body: notification.body,
        icon: "/notification-icon.png",
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
