"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Calendar, Book, Clock, AlertTriangle, ExternalLink, Search } from "lucide-react"
import Image from "next/image"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { DeleteTaskDialog } from "./delete-task-dialog"
import { ImageModal } from "./image-modal"
import type { Task } from "@/lib/types"
import { getTasks, deleteTask } from "@/lib/tasks"
import { scheduleTaskReminders } from "@/lib/notification"

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State untuk modal gambar
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>("")

  // Tambahkan fungsi refreshTasks
  const refreshTasks = async () => {
    try {
      setIsLoading(true)
      const fetchedTasks = await getTasks()
      setTasks(fetchedTasks)
      setError(null)

      // Jadwalkan notifikasi untuk tugas yang akan jatuh tempo besok
      await scheduleTaskReminders()
    } catch (err) {
      console.error("Error fetching tasks:", err)
      setError("Gagal memuat tugas. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  // Tambahkan interval untuk menyegarkan tugas secara berkala
  useEffect(() => {
    // Muat tugas saat komponen dimuat
    refreshTasks()

    // Segarkan tugas setiap 5 menit
    const interval = setInterval(() => {
      refreshTasks()
    }, 300000) // 5 menit

    // Bersihkan interval saat komponen dibongkar
    return () => clearInterval(interval)
  }, [])

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (taskToDelete) {
      try {
        const result = await deleteTask(taskToDelete)
        if (result.success) {
          setTasks(tasks.filter((task) => task.id !== taskToDelete))
          setIsDeleteDialogOpen(false)
          setTaskToDelete(null)
        } else {
          console.error("Error deleting task:", result.error)
        }
      } catch (err) {
        console.error("Error deleting task:", err)
      }
    }
  }

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setIsImageModalOpen(true)
  }

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusBadge = (dueDate: string) => {
    const daysRemaining = getDaysRemaining(dueDate)

    if (daysRemaining < 0) {
      return (
        <Badge variant="destructive" className="animate-pulse-slow">
          <AlertTriangle className="mr-1 h-3 w-3" /> Terlambat
        </Badge>
      )
    } else if (daysRemaining === 0) {
      return (
        <Badge variant="destructive" className="animate-pulse-slow">
          <Clock className="mr-1 h-3 w-3" /> Hari Ini
        </Badge>
      )
    } else if (daysRemaining === 1) {
      return (
        <Badge className="bg-yellow-500 text-white animate-pulse-slow">
          <Clock className="mr-1 h-3 w-3" /> Besok
        </Badge>
      )
    } else if (daysRemaining <= 3) {
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-500">
          <Clock className="mr-1 h-3 w-3" /> Segera
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline">
          <Calendar className="mr-1 h-3 w-3" /> Mendatang
        </Badge>
      )
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex space-x-2 justify-center items-center">
          <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
          <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
          <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
        </div>
        <p className="mt-4 text-muted-foreground">Memuat tugas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
        <div className="mb-4 rounded-full bg-red-100 p-3">
          <Trash2 className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold">Terjadi Kesalahan</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button className="mt-4" onClick={() => refreshTasks()}>
          Coba Lagi
        </Button>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
        <div className="mb-4 rounded-full bg-muted p-3">
          <Book className="h-10 w-10 text-primary animate-bounce-slow" />
        </div>
        <h2 className="text-xl font-semibold">Belum ada tugas</h2>
        <p className="text-muted-foreground mt-2">Tambahkan tugas pertama Anda dengan mengklik tombol "Tambah Tugas"</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task, index) => (
          <div key={task.id} className="task-card" style={{ animationDelay: `${index * 0.1}s` }}>
            <Card className="overflow-hidden border-l-4 border-l-primary h-full flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  {getStatusBadge(task.due_date)}
                </div>
                <p className="text-sm text-muted-foreground">{task.subject}</p>
              </CardHeader>

              {task.images && task.images.length > 0 && (
                <div className="px-6 flex gap-2 overflow-x-auto pb-2">
                  {task.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative min-w-[150px] h-[100px] rounded-md overflow-hidden group cursor-pointer"
                      onClick={() => handleImageClick(image.image_url)}
                    >
                      <Image
                        src={image.image_url || "/placeholder.svg"}
                        alt={`Gambar tugas ${index + 1}`}
                        fill
                        className="object-cover hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Search className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <CardContent className="pb-2 flex-grow">
                <p className="text-sm">{task.description}</p>

                {task.submission_link && (
                  <div className="mt-3">
                    <a
                      href={task.submission_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Link Pengumpulan
                    </a>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-between pt-2 border-t">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4 text-primary" />
                  {format(new Date(task.due_date), "dd MMMM yyyy", { locale: id })}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteClick(task.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>

      <DeleteTaskDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />

      <ImageModal isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} imageUrl={selectedImage} />
    </>
  )
}
