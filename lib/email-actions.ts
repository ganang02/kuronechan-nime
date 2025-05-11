"use server"

import emailjs from "@emailjs/browser"

// Konfigurasi EmailJS dengan variabel lingkungan server
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || ""
const EMAILJS_VERIFICATION_TEMPLATE_ID = process.env.EMAILJS_VERIFICATION_TEMPLATE_ID || ""
const EMAILJS_NEW_TASK_TEMPLATE_ID = process.env.EMAILJS_NEW_TASK_TEMPLATE_ID || ""
const EMAILJS_REMINDER_TEMPLATE_ID = process.env.EMAILJS_REMINDER_TEMPLATE_ID || ""
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || ""

// Inisialisasi EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY)

// Server action untuk mengirim email verifikasi
export async function sendVerificationEmailAction(
  email: string,
  token: string,
): Promise<{ success: boolean; error?: any }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ""
  const verificationUrl = `${appUrl}/verify-email?token=${token}`

  try {
    // Periksa apakah konfigurasi EmailJS tersedia
    if (!EMAILJS_SERVICE_ID || !EMAILJS_VERIFICATION_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.error("EmailJS configuration is missing")
      return { success: false, error: "Email service configuration is missing" }
    }

    const response = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_VERIFICATION_TEMPLATE_ID, {
      to_email: email,
      verification_url: verificationUrl,
      app_name: "Tugas X.1",
      current_year: new Date().getFullYear(),
    })

    if (response.status === 200) {
      return { success: true }
    } else {
      return { success: false, error: `Status: ${response.status}, Text: ${response.text}` }
    }
  } catch (error) {
    console.error("Error sending verification email:", error)
    return { success: false, error }
  }
}

// Server action untuk mengirim notifikasi tugas baru
export async function sendNewTaskNotificationAction(
  email: string,
  task: {
    title: string
    subject: string
    due_date: string
    description?: string | null
    submission_link?: string | null
  },
): Promise<{ success: boolean; error?: any }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ""

  // Format tanggal dengan lebih baik
  const dueDate = new Date(task.due_date)
  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dueDate)

  try {
    // Periksa apakah konfigurasi EmailJS tersedia
    if (!EMAILJS_SERVICE_ID || !EMAILJS_NEW_TASK_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.error("EmailJS configuration is missing")
      return { success: false, error: "Email service configuration is missing" }
    }

    const response = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_NEW_TASK_TEMPLATE_ID, {
      to_email: email,
      task_title: task.title,
      task_subject: task.subject,
      task_due_date: formattedDate,
      task_description: task.description || "Tidak ada deskripsi",
      task_submission_link: task.submission_link || "Tidak ada link pengumpulan",
      app_url: appUrl,
      app_name: "Tugas X.1",
      current_year: new Date().getFullYear(),
    })

    if (response.status === 200) {
      return { success: true }
    } else {
      return { success: false, error: `Status: ${response.status}, Text: ${response.text}` }
    }
  } catch (error) {
    console.error("Error sending new task notification:", error)
    return { success: false, error }
  }
}

// Server action untuk mengirim pengingat tugas H-1
export async function sendTaskReminderNotificationAction(
  email: string,
  tasks: Array<{
    title: string
    subject: string
    due_date: string
    description?: string | null
    submission_link?: string | null
  }>,
): Promise<{ success: boolean; error?: any }> {
  if (tasks.length === 0) return { success: true }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ""

  // Format tanggal besok
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(tomorrow)

  // Buat daftar tugas dalam format HTML
  const tasksHtml = tasks
    .map(
      (task) => `
    <div style="margin-bottom: 15px; padding: 10px; border-left: 4px solid #ff6600; background-color: #fff3e0;">
      <h3 style="margin-top: 0; color: #ff6600;">${task.title}</h3>
      <p><strong>Mata Pelajaran:</strong> ${task.subject}</p>
      ${task.description ? `<p><strong>Deskripsi:</strong> ${task.description}</p>` : ""}
      ${task.submission_link ? `<p><strong>Link Pengumpulan:</strong> <a href="${task.submission_link}">${task.submission_link}</a></p>` : ""}
    </div>
  `,
    )
    .join("")

  try {
    // Periksa apakah konfigurasi EmailJS tersedia
    if (!EMAILJS_SERVICE_ID || !EMAILJS_REMINDER_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.error("EmailJS configuration is missing")
      return { success: false, error: "Email service configuration is missing" }
    }

    // Karena kita menggunakan template yang sama dengan notifikasi tugas baru,
    // kita perlu menyesuaikan parameter yang dikirim
    const response = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_REMINDER_TEMPLATE_ID, {
      to_email: email,
      task_title: `Pengingat: ${tasks.length} Tugas Jatuh Tempo Besok`,
      task_subject: "Beberapa Mata Pelajaran",
      task_due_date: formattedDate,
      task_description: `Berikut adalah tugas yang akan jatuh tempo besok (${formattedDate}):\n\n${tasksHtml}`,
      task_submission_link: appUrl,
      app_url: appUrl,
      app_name: "Tugas X.1",
      current_year: new Date().getFullYear(),
    })

    if (response.status === 200) {
      return { success: true }
    } else {
      return { success: false, error: `Status: ${response.status}, Text: ${response.text}` }
    }
  } catch (error) {
    console.error("Error sending task reminder notification:", error)
    return { success: false, error }
  }
}

// Server action untuk mengirim email uji coba
export async function sendTestEmailAction(email: string): Promise<{ success: boolean; error?: any }> {
  try {
    // Periksa apakah konfigurasi EmailJS tersedia
    if (!EMAILJS_SERVICE_ID || !EMAILJS_NEW_TASK_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.error("EmailJS configuration is missing")
      return { success: false, error: "Email service configuration is missing" }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ""

    const response = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_NEW_TASK_TEMPLATE_ID, {
      to_email: email,
      task_title: "Email Uji Coba - Tugas X.1",
      task_subject: "Uji Coba Notifikasi",
      task_due_date: new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      task_description: "Ini adalah email uji coba untuk memastikan sistem notifikasi email berfungsi dengan baik.",
      task_submission_link: appUrl,
      app_url: appUrl,
      app_name: "Tugas X.1",
      current_year: new Date().getFullYear(),
    })

    if (response.status === 200) {
      return { success: true }
    } else {
      return { success: false, error: `Status: ${response.status}, Text: ${response.text}` }
    }
  } catch (error) {
    console.error("Error sending test email:", error)
    return { success: false, error }
  }
}
