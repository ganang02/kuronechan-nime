import { getSupabaseClient } from "./supabase"
import type { Task } from "./types"
import { sendNewTaskNotificationToAll } from "./subscribers"

export async function getTasks(): Promise<Task[]> {
  const supabase = getSupabaseClient()

  // Ambil semua tugas
  const { data: tasks, error } = await supabase.from("tasks").select("*").order("due_date", { ascending: true })

  if (error) {
    console.error("Error fetching tasks:", error)
    return []
  }

  // Ambil gambar untuk setiap tugas
  const tasksWithImages = await Promise.all(
    tasks.map(async (task) => {
      const { data: images, error: imagesError } = await supabase.from("task_images").select("*").eq("task_id", task.id)

      if (imagesError) {
        console.error("Error fetching task images:", imagesError)
        return { ...task, images: [] }
      }

      return { ...task, images: images || [] }
    }),
  )

  return tasksWithImages
}

// Perbarui fungsi addTask untuk mengirim notifikasi email
export async function addTask(
  task: Omit<Task, "id" | "created_at" | "updated_at">,
  images: string[],
): Promise<{ success: boolean; task?: Task; error?: any }> {
  const supabase = getSupabaseClient()

  // Tambahkan tugas baru
  const { data: newTask, error } = await supabase
    .from("tasks")
    .insert([
      {
        title: task.title,
        subject: task.subject,
        description: task.description,
        due_date: task.due_date,
        submission_link: task.submission_link,
        // Jangan sertakan created_by karena kita belum memiliki autentikasi
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error adding task:", error)
    return { success: false, error }
  }

  // Tambahkan gambar jika ada
  if (images.length > 0 && newTask) {
    const imageInserts = images.map((imageUrl) => ({
      task_id: newTask.id,
      image_url: imageUrl,
    }))

    const { error: imageError } = await supabase.from("task_images").insert(imageInserts)

    if (imageError) {
      console.error("Error adding task images:", imageError)
      // Tetap lanjutkan meskipun ada error pada gambar
    }
  }

  // Kirim notifikasi email untuk tugas baru (asynchronous)
  if (newTask) {
    sendNewTaskNotificationToAll(newTask).catch((err) => {
      console.error("Error sending email notifications:", err)
    })
  }

  return { success: true, task: newTask }
}

export async function deleteTask(taskId: string): Promise<{ success: boolean; error?: any }> {
  const supabase = getSupabaseClient()

  // Hapus tugas (gambar akan otomatis terhapus karena ON DELETE CASCADE)
  const { error } = await supabase.from("tasks").delete().eq("id", taskId)

  if (error) {
    console.error("Error deleting task:", error)
    return { success: false, error }
  }

  return { success: true }
}

// Perbarui fungsi verifyPin untuk menangani error dengan lebih baik
export async function verifyPin(pin: string): Promise<boolean> {
  if (!pin) return false

  const supabase = getSupabaseClient()

  try {
    const { data, error } = await supabase.from("settings").select("pin").single()

    if (error) {
      console.error("Error verifying PIN:", error)
      return false
    }

    return data?.pin === pin
  } catch (err) {
    console.error("Exception verifying PIN:", err)
    return false
  }
}
