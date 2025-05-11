"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, CheckCircle, XCircle, ArrowLeft, Loader2, Mail } from "lucide-react"
import Link from "next/link"
import { registerServiceWorker } from "@/lib/notification"
import { sendTestEmail } from "@/lib/email"
import { useToast } from "@/hooks/use-toast"

export default function EnableNotificationsPage() {
  const [notificationStatus, setNotificationStatus] = useState<"default" | "granted" | "denied">("default")
  const [isRegistering, setIsRegistering] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [email, setEmail] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setNotificationStatus(Notification.permission as "default" | "granted" | "denied")
    }

    // Cek apakah service worker sudah terdaftar
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          setSwRegistration(registration)
        }
      })
    }

    // Coba ambil email dari localStorage jika ada
    const savedEmail = localStorage.getItem("userEmail")
    if (savedEmail) {
      setEmail(savedEmail)
    }
  }, [])

  const requestNotificationPermission = async () => {
    setIsRegistering(true)

    try {
      // Register service worker first
      const registration = await registerServiceWorker()
      setSwRegistration(registration)

      // Then request permission
      const permission = await Notification.requestPermission()
      setNotificationStatus(permission)

      // If granted, send a test notification
      if (permission === "granted") {
        // Gunakan registration.showNotification untuk menampilkan notifikasi
        await registration.showNotification("Notifikasi Berhasil Diaktifkan", {
          body: "Anda akan menerima notifikasi untuk tugas-tugas yang akan datang.",
          icon: "/notification-icon.png",
          vibrate: [100, 50, 100],
        })
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error)
    } finally {
      setIsRegistering(false)
    }
  }

  const sendTestNotification = async () => {
    if (!swRegistration) return

    try {
      await swRegistration.showNotification("Notifikasi Uji Coba", {
        body: "Ini adalah notifikasi uji coba. Jika Anda melihat ini, notifikasi berfungsi dengan baik!",
        icon: "/notification-icon.png",
        vibrate: [100, 50, 100],
      })
    } catch (error) {
      console.error("Error sending test notification:", error)
    }
  }

  const handleSendTestEmail = async () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast({
        title: "Error",
        description: "Silakan masukkan alamat email yang valid",
        variant: "destructive",
      })
      return
    }

    setIsSendingEmail(true)

    try {
      const result = await sendTestEmail(email)

      if (result.success) {
        toast({
          title: "Email Uji Coba Terkirim",
          description: "Silakan periksa kotak masuk email Anda.",
        })
        // Simpan email di localStorage untuk penggunaan berikutnya
        localStorage.setItem("userEmail", email)
      } else {
        console.error("Error sending test email:", result.error)
        toast({
          title: "Error",
          description: `Gagal mengirim email uji coba: ${result.error?.message || "Silakan coba lagi."}`,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error sending test email:", err)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengirim email uji coba",
        variant: "destructive",
      })
    } finally {
      setIsSendingEmail(false)
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
          <CardTitle className="flex items-center gap-2 text-primary">
            <Bell className="h-5 w-5 animate-bell" />
            Notifikasi Tugas X.1
          </CardTitle>
          <CardDescription>Aktifkan notifikasi untuk mendapatkan pengingat tugas</CardDescription>
        </CardHeader>

        <CardContent>
          {notificationStatus === "granted" ? (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-md">
                <CheckCircle className="h-5 w-5" />
                <p>Notifikasi browser sudah diaktifkan</p>
              </div>

              <div className="mt-4">
                <Button
                  onClick={sendTestNotification}
                  variant="outline"
                  className="w-full border-primary/20 hover:bg-primary/10"
                >
                  Kirim Notifikasi Uji Coba
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Klik tombol di atas untuk menguji apakah notifikasi browser berfungsi dengan baik
                </p>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Uji Notifikasi Email
                </h3>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Masukkan email Anda"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <Button
                    onClick={handleSendTestEmail}
                    disabled={isSendingEmail}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isSendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Masukkan email Anda dan klik tombol untuk mengirim email uji coba
                </p>
              </div>
            </div>
          ) : notificationStatus === "denied" ? (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-md animate-fade-in">
              <XCircle className="h-5 w-5" />
              <p>
                Notifikasi ditolak. Silakan ubah pengaturan browser Anda untuk mengizinkan notifikasi dari situs ini.
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <p>Dengan mengaktifkan notifikasi, Anda akan menerima:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 bg-accent p-3 rounded-md">
                  <div className="bg-primary rounded-full p-1 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span>Pengingat saat tugas akan jatuh tempo (H-1)</span>
                </li>
                <li className="flex items-start gap-2 bg-accent p-3 rounded-md">
                  <div className="bg-primary rounded-full p-1 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span>Pemberitahuan saat tugas baru ditambahkan</span>
                </li>
              </ul>
            </div>
          )}
        </CardContent>

        <CardFooter>
          {notificationStatus !== "granted" && (
            <Button
              onClick={requestNotificationPermission}
              disabled={isRegistering || notificationStatus === "denied"}
              className="w-full bg-primary hover:bg-primary/90 shadow-lg"
            >
              {isRegistering ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memproses...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span>Aktifkan Notifikasi</span>
                </div>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
