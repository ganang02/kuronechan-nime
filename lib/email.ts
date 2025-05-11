import {
  sendVerificationEmailAction,
  sendNewTaskNotificationAction,
  sendTaskReminderNotificationAction,
} from "./email-actions"

// Fungsi wrapper untuk mengirim email verifikasi
export async function sendVerificationEmail(email: string, token: string): Promise<{ success: boolean; error?: any }> {
  return sendVerificationEmailAction(email, token)
}

// Fungsi wrapper untuk mengirim notifikasi tugas baru
export async function sendNewTaskNotification(
  email: string,
  task: {
    title: string
    subject: string
    due_date: string
    description?: string | null
    submission_link?: string | null
  },
): Promise<{ success: boolean; error?: any }> {
  return sendNewTaskNotificationAction(email, task)
}

// Fungsi wrapper untuk mengirim pengingat tugas H-1
export async function sendTaskReminderNotification(
  email: string,
  tasks: Array<{
    title: string
    subject: string
    due_date: string
    description?: string | null
    submission_link?: string | null
  }>,
): Promise<{ success: boolean; error?: any }> {
  return sendTaskReminderNotificationAction(email, tasks)
}
