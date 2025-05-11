"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Loader2, Send } from "lucide-react"
import Link from "next/link"
import { addSubscriber, sendSubscriberVerificationEmail } from "@/lib/subscribers"
import { sendTestEmail } from "@/lib/email"
import { useToast } from "@/hooks/use-toast"

export default function SubscribePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        setError("Silakan masukkan alamat email yang valid")
        setIsSubmitting(false)
        return
      }

      // Tambahkan subscriber
      const result = await addSubscriber(email)

      if (result.success && result.subscriber) {
        // Kirim email verifikasi jika belum terverifikasi
        if (!result.subscriber.verified && result.subscriber.verification_token) {
          const emailResult = await sendSubscriberVerificationEmail(result.subscriber)

          if (!emailResult.success) {
            console.error("Error sending verification email:", emailResult.error)
            toast({
              title: "Perhatian",
              description:
                "Email berhasil didaftarkan, tetapi gagal mengirim email verifikasi. Silakan coba lagi nanti.",
              variant: "destructive",
            })
          }
        }

        setSuccess(true)
        toast({
          title: "Berhasil!",
          description: "Silakan periksa email Anda untuk tautan verifikasi.",
        })
      } else {
        console.error("Error detail:", result.error)
        setError(`Gagal mendaftarkan email: ${result.error?.message || "Silakan coba lagi."}`)
      }
    } catch (err) {
      console.error("Error subscribing:", err)
      setError("Terjadi kesalahan saat mendaftarkan email")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendTestEmail = async () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Silakan masukkan alamat email yang valid")
      return
    }

    setIsSendingTest(true)
    setError("")

    try {
      const result = await sendTestEmail(email)

      if (result.success) {
        toast({
          title: "Email Uji Coba Terkirim",
          description: "Silakan periksa kotak masuk email Anda.",
        })
      } else {
        console.error("Error sending test email:", result.error)
        setError(`Gagal mengirim email uji coba: ${result.error?.message || "Silakan coba lagi."}`)
      }
    } catch (err) {
      console.error("Error sending test email:", err)
      setError("Terjadi kesalahan saat mengirim email uji coba")
    } finally {
      setIsSendingTest(false)
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

      <Card className="max-w-md mx-auto border-t-4 border-t-primary animate-fade-in shadow-lg">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Berlangganan Notifikasi Email
          </CardTitle>
          <CardDescription>
            Dapatkan notifikasi email saat ada tugas baru atau pengingat H-1 sebelum tugas jatuh tempo.
          </CardDescription>
        </CardHeader>

        {success ? (
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center py-6 text-center animate-fade-in">
              <div className="mb-4 rounded-full bg-green-100 p-3">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold">Email Terdaftar!</h2>
              <p className="text-muted-foreground mt-2">
                Silakan periksa email Anda untuk tautan verifikasi. Jika Anda tidak menerima email dalam beberapa menit,
                periksa folder spam Anda.
              </p>
              <Button className="mt-4" onClick={() => router.push("/")}>
                Kembali ke Beranda
              </Button>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid gap-2 animate-fade-in">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary"></div>
                  Alamat Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError("")
                  }}
                  className="border-primary/20 focus-visible:ring-primary"
                  required
                />
                {error && (
                  <div className="flex items-center gap-2 text-destructive text-sm mt-1 animate-fade-in">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
              </div>

              <div className="bg-accent p-3 rounded-md text-sm animate-fade-in">
                <p className="font-medium mb-2">Dengan berlangganan, Anda akan menerima:</p>
                <ul className="space-y-1 list-disc pl-5">
                  <li>Notifikasi saat tugas baru ditambahkan</li>
                  <li>Pengingat H-1 sebelum tugas jatuh tempo</li>
                  <li>Informasi penting lainnya terkait tugas</li>
                </ul>
              </div>

              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendTestEmail}
                  disabled={isSendingTest || isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSendingTest ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Kirim Email Uji Coba</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 shadow-lg transition-all hover:shadow-xl"
                disabled={isSubmitting || isSendingTest}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memproses...</span>
                  </div>
                ) : (
                  "Berlangganan"
                )}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
