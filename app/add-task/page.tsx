"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Upload, ArrowLeft, BookOpen, Clock, FileText, LinkIcon } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { addTask, verifyPin } from "@/lib/tasks"
import { useToast } from "@/hooks/use-toast"

export default function AddTaskPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [submissionLink, setSubmissionLink] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files)
      const filePromises = fileArray.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
      })

      Promise.all(filePromises).then((results) => {
        setImages((prev) => [...prev, ...results])
      })
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  // Perbarui fungsi handleSubmit untuk menangani error dengan lebih baik
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      if (!title || !subject || !date) {
        setError("Judul, mata pelajaran, dan tanggal wajib diisi")
        setIsSubmitting(false)
        return
      }

      // Verifikasi PIN
      const isPinValid = await verifyPin(pin)
      if (!isPinValid) {
        setError("PIN tidak valid")
        setIsSubmitting(false)
        return
      }

      // Tambahkan tugas baru
      const result = await addTask(
        {
          title,
          subject,
          description: description || null,
          due_date: date!.toISOString(),
          submission_link: submissionLink || null,
        },
        images,
      )

      if (result.success) {
        toast({
          title: "Tugas berhasil ditambahkan",
          description: "Tugas baru telah berhasil disimpan",
        })

        // Notifikasi browser jika diizinkan
        if (Notification.permission === "granted") {
          new Notification("Tugas Baru Ditambahkan", {
            body: `${title} - ${subject}`,
            icon: "/notification-icon.png",
          })
        }

        router.push("/")
      } else {
        console.error("Error detail:", result.error)
        setError(`Gagal menambahkan tugas: ${result.error?.message || "Silakan coba lagi."}`)
      }
    } catch (err) {
      console.error("Error saving task:", err)
      setError("Terjadi kesalahan saat menyimpan tugas")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 page-transition">
      <Link
        href="/"
        className="flex items-center text-muted-foreground hover:text-foreground mb-6 animate-slide-in-left"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali
      </Link>

      <Card className="max-w-2xl mx-auto border-t-4 border-t-primary animate-fade-in shadow-lg">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Tambah Tugas - Tugas X.1
          </CardTitle>
          <CardDescription>Masukkan detail tugas dan PIN untuk menambahkan tugas baru.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid gap-2 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <Label htmlFor="title" className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary"></div>
                Judul Tugas
              </Label>
              <Input
                id="title"
                placeholder="Masukkan judul tugas"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-primary/20 focus-visible:ring-primary"
              />
            </div>

            <div className="grid gap-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <Label htmlFor="subject" className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary"></div>
                Mata Pelajaran
              </Label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="subject"
                  placeholder="Contoh: Matematika, Fisika, dll."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="pl-10 border-primary/20 focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="grid gap-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Label htmlFor="description" className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary"></div>
                Deskripsi (Opsional)
              </Label>
              <Textarea
                id="description"
                placeholder="Deskripsi tugas..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="border-primary/20 focus-visible:ring-primary"
              />
            </div>

            <div className="grid gap-2 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <Label className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary"></div>
                Tanggal Pengumpulan
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal border-primary/20",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <Clock className="mr-2 h-4 w-4 text-primary" />
                    {date ? format(date, "dd MMMM yyyy", { locale: id }) : "Pilih tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2 animate-fade-in" style={{ animationDelay: "0.45s" }}>
              <Label htmlFor="submissionLink" className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary"></div>
                Link Pengumpulan (Opsional)
              </Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="submissionLink"
                  type="url"
                  placeholder="https://classroom.google.com/..."
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  className="pl-10 border-primary/20 focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="grid gap-2 animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <Label htmlFor="images" className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary"></div>
                Gambar (Opsional)
              </Label>
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="image-upload"
                  className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-primary/20 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Upload className="h-4 w-4 text-primary" />
                  Unggah Gambar
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative h-24 rounded-md overflow-hidden group">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 rounded-full bg-background/80 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-2 animate-fade-in" style={{ animationDelay: "0.6s" }}>
              <Label htmlFor="pin" className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary"></div>
                PIN
              </Label>
              <Input
                id="pin"
                type="password"
                placeholder="Masukkan PIN"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value)
                  setError("")
                }}
                className="border-primary/20 focus-visible:ring-primary"
              />
              {error && (
                <p className="text-sm text-destructive animate-fade-in bg-destructive/10 p-2 rounded-md">{error}</p>
              )}
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 shadow-lg transition-all hover:shadow-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-white loading-dot"></div>
                    <div className="w-2 h-2 rounded-full bg-white loading-dot"></div>
                    <div className="w-2 h-2 rounded-full bg-white loading-dot"></div>
                  </div>
                  <span>Menyimpan...</span>
                </div>
              ) : (
                "Simpan Tugas"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
