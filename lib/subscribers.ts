import { getSupabaseClient } from "./supabase"
import type { Subscriber } from "./types"
import { v4 as uuidv4 } from "uuid"
import { sendVerificationEmail, sendNewTaskNotification, sendTaskReminderNotification } from "./email"

// Fungsi untuk menambahkan subscriber baru
export async function addSubscriber(
  email: string,
): Promise<{ success: boolean; error?: any; subscriber?: Subscriber }> {
  const supabase = getSupabaseClient()
  const verificationToken = uuidv4()

  try {
    // Cek apakah email sudah terdaftar
    const { data: existingSubscriber } = await supabase.from("subscribers").select("*").eq("email", email).single()

    if (existingSubscriber) {
      // Jika sudah terdaftar tapi belum terverifikasi, update token verifikasi
      if (!existingSubscriber.verified) {
        const { data, error } = await supabase
          .from("subscribers")
          .update({ verification_token: verificationToken })
          .eq("id", existingSubscriber.id)
          .select()
          .single()

        if (error) throw error
        return { success: true, subscriber: data }
      }

      // Jika sudah terdaftar dan terverifikasi
      return { success: true, subscriber: existingSubscriber }
    }

    // Jika belum terdaftar, tambahkan subscriber baru
    const { data, error } = await supabase
      .from("subscribers")
      .insert([
        {
          email,
          verification_token: verificationToken,
          verified: false,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return { success: true, subscriber: data }
  } catch (error) {
    console.error("Error adding subscriber:", error)
    return { success: false, error }
  }
}

// Fungsi untuk memverifikasi subscriber
export async function verifySubscriber(token: string): Promise<{ success: boolean; error?: any }> {
  const supabase = getSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("subscribers")
      .update({ verified: true, verification_token: null })
      .eq("verification_token", token)
      .select()

    if (error) throw error
    if (!data || data.length === 0) {
      return { success: false, error: "Token verifikasi tidak valid" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error verifying subscriber:", error)
    return { success: false, error }
  }
}

// Fungsi untuk mendapatkan semua subscriber yang terverifikasi
export async function getVerifiedSubscribers(): Promise<Subscriber[]> {
  const supabase = getSupabaseClient()

  try {
    const { data, error } = await supabase.from("subscribers").select("*").eq("verified", true)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error getting verified subscribers:", error)
    return []
  }
}

// Fungsi untuk mengirim email verifikasi ke subscriber
export async function sendSubscriberVerificationEmail(
  subscriber: Subscriber,
): Promise<{ success: boolean; error?: any }> {
  if (!subscriber.verification_token) {
    return { success: false, error: "Token verifikasi tidak ditemukan" }
  }

  return await sendVerificationEmail(subscriber.email, subscriber.verification_token)
}

// Fungsi untuk mengirim notifikasi tugas baru ke semua subscriber
export async function sendNewTaskNotificationToAll(task: {
  title: string
  subject: string
  due_date: string
  description?: string | null
  submission_link?: string | null
}): Promise<void> {
  try {
    const subscribers = await getVerifiedSubscribers()

    for (const subscriber of subscribers) {
      await sendNewTaskNotification(subscriber.email, task)

      // Update last_notified
      const supabase = getSupabaseClient()
      await supabase.from("subscribers").update({ last_notified: new Date().toISOString() }).eq("id", subscriber.id)
    }
  } catch (error) {
    console.error("Error sending new task notifications:", error)
  }
}

// Fungsi untuk mengirim pengingat tugas H-1 ke semua subscriber
export async function sendTaskReminders(): Promise<void> {
  const supabase = getSupabaseClient()

  try {
    // Ambil semua tugas yang jatuh tempo besok
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("*")
      .gte("due_date", tomorrow.toISOString())
      .lt("due_date", dayAfterTomorrow.toISOString())

    if (error) throw error
    if (!tasks || tasks.length === 0) return

    // Ambil semua subscriber yang terverifikasi
    const subscribers = await getVerifiedSubscribers()
    if (subscribers.length === 0) return

    // Kirim email pengingat untuk setiap subscriber
    for (const subscriber of subscribers) {
      await sendTaskReminderNotification(subscriber.email, tasks)

      // Update last_notified
      await supabase.from("subscribers").update({ last_notified: new Date().toISOString() }).eq("id", subscriber.id)
    }
  } catch (error) {
    console.error("Error sending task reminders:", error)
  }
}
