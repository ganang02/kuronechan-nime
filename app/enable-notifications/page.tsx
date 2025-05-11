"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, CheckCircle, XCircle, ArrowLeft, Loader2, Mail, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { registerServiceWorker, showNotification } from "@/lib/notification"
import { sendTestEmail } from "@/lib/email"
import { useToast } from "@/hooks/use-toast"

export default function EnableNotificationsPage() {
  const [notificationStatus, setNotificationStatus] = useState<"default" | "granted" | "denied">("default")
  const [isRegistering, setIsRegistering] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [isSendingNotification, setIsSendingNotification] = useState(false)
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [swStatus, setSwStatus] = useState<string>("Checking service worker status...")
  const [email, setEmail] = useState("")
  const { toast } = useToast()

  // Fungsi untuk memeriksa status service worker
  const checkServiceWorker = async () => {
    try {
      if (!("serviceWorker" in navigator)) {
        setSwStatus("Service Worker tidak didukung di browser ini")
        return
      }

      const registrations = await navigator.serviceWorker.getRegistrations()
      if (registrations.length === 0) {
        setSwStatus("Service Worker belum terdaftar")
        return
      }

      const activeRegistration = registrations.find((r) => r.active)
      if (!activeRegistration) {
        setSwStatus("Service Worker terdaftar tetapi tidak aktif")
        return
      }

      setSwRegistration(activeRegistration)
      setSwStatus("Service Worker aktif dan siap")

      // Coba kirim pesan ke service worker untuk memastikan komunikasi berfungsi
      if (activeRegistration.active) {
        const messageChannel = new MessageChannel()
        messageChannel.port1.onmessage = (event) => {
          console.log("Response from service worker:", event.data)
          if (event.data && event.data.type === "PONG") {
            setSwStatus("Service Worker merespons: " + event.data.status)
          }
        }

        activeRegistration.active.postMessage({ type: "PING" }, [messageChannel.port2])
      }
    } catch (error) {
      console.error("Error checking service worker:", error)
      setSwStatus(`Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setNotificationStatus(Notification.permission as "default" | "granted" | "denied")
    }

    // Periksa status service worker saat komponen dimuat
    checkServiceWorker()

    // Coba ambil email dari localStorage jika ada
    const savedEmail = localStorage.getItem("userEmail")
    if (savedEmail) {
      setEmail(savedEmail)
    }
  }, [])

  const requestNotificationPermission = async () => {
    setIsRegistering(true)
    setSwStatus("Memulai pendaftaran Service Worker...")

    try {
      // Register service worker first
      const registration = await registerServiceWorker()
      setSwRegistration(registration)
      setSwStatus("Service Worker berhasil terdaftar dan aktif")

      // Then request permission
      console.log("Requesting notification permission...")
      const permission = await Notification.requestPermission()
      console.log("Notification permission:", permission)
      setNotificationStatus(permission)

      // If granted, send a test notification
      if (permission === "granted") {
        console.log("Permission granted, showing notification...")
        try {
          // Gunakan showNotification untuk menampilkan notifikasi
          await showNotification("Notifikasi Berhasil Diaktifkan", {
            body: "Anda akan menerima notifikasi untuk tugas-tugas yang akan datang.",
          })
          console.log("Notification should be shown now")
        } catch (error) {
          console.error("Error showing notification:", error)
        }
      }
    } catch (error) {
      console.error("Error in notification setup:", error)
      setSwStatus(`Error: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        title: "Error",
        description: `Gagal mengaktifkan notifikasi: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsRegistering(false)
    }
  }

  const sendTestNotification = async () => {
    setIsSendingNotification(true)

    try {
      console.log("Attempting to send test notification...")

      // Metode 1: Menggunakan fungsi showNotification
      const result = await showNotification("Notifikasi Uji Coba", {
        body: "Ini adalah notifikasi uji coba. Jika Anda melihat ini, notifikasi berfungsi dengan baik!",
      })

      if (result) {
        console.log("Notification sent successfully")
      } else {
        console.log("Failed to send notification")
      }

      toast({
        title: "Notifikasi Terkirim",
        description: "Notifikasi uji coba telah dikirim. Periksa notifikasi browser Anda.",
      })
    } catch (error) {
      console.error("Error sending test notification:", error)
      toast({
        title: "Error",
        description: `Gagal mengirim notifikasi: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsSendingNotification(false)
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

  // Fungsi untuk menampilkan notifikasi langsung tanpa service worker
  const sendDirectNotification = () => {
    try {
      if (!("Notification" in window)) {
        toast({
          title: "Error",
          description: "Browser Anda tidak mendukung notifikasi",
          variant: "destructive",
        })
        return
      }

      if (Notification.permission !== "granted") {
        toast({
          title: "Error",
          description: "Izin notifikasi belum diberikan",
          variant: "destructive",
        })
        return
      }

      // Gunakan constructor dengan benar
      new Notification("Notifikasi Langsung", {
        body: "Ini adalah notifikasi langsung tanpa service worker",
        icon: "/notification-icon.png",
      })

      toast({
        title: "Notifikasi Terkirim",
        description: "Notifikasi langsung telah dikirim",
      })
    } catch (error) {
      console.error("Error sending direct notification:", error)
      toast({
        title: "Error",
        description: `Gagal mengirim notifikasi langsung: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
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
          {/* Status Service Worker */}
          <div className="mb-4 p-3 bg-accent rounded-md text-sm">
            <p className="font-medium flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
              Status Service Worker:
            </p>
            <p className="mt-1 text-muted-foreground">{swStatus}</p>
            <Button variant="outline" size="sm" className="mt-2 text-xs" onClick={checkServiceWorker}>
              Periksa Ulang
            </Button>
          </div>

          {notificationStatus === "granted" ? (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-md">
                <CheckCircle className="h-5 w-5" />
                <p>Notifikasi browser sudah diaktifkan</p>
              </div>

              <div className="mt-4 space-y-2">
                <Button
                  onClick={sendTestNotification}
                  variant="outline"
                  className="w-full border-primary/20 hover:bg-primary/10"
                  disabled={isSendingNotification}
                >
                  {isSendingNotification ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Mengirim...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <span>Kirim Notifikasi via Service Worker</span>
                    </div>
                  )}
                </Button>

                <Button
                  onClick={sendDirectNotification}
                  variant="outline"
                  className="w-full border-primary/20 hover:bg-primary/10"
                >
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span>Kirim Notifikasi Langsung</span>
                  </div>
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
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-md">
                <XCircle className="h-5 w-5" />
                <p>
                  Notifikasi ditolak. Silakan ubah pengaturan browser Anda untuk mengizinkan notifikasi dari situs ini.
                </p>
              </div>

              <div className="mt-4 p-4 border border-yellow-200 bg-yellow-50 rounded-md">
                <h3 className="text-sm font-medium flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-4 w-4" />
                  Cara Mengaktifkan Notifikasi
                </h3>
                <ol className="mt-2 text-sm text-yellow-700 list-decimal pl-5 space-y-1">
                  <li>Klik ikon kunci/info di bilah alamat browser</li>
                  <li>Cari pengaturan "Notifikasi"</li>
                  <li>Ubah dari "Blokir" menjadi "Izinkan"</li>
                  <li>Muat ulang halaman ini</li>
                </ol>
              </div>
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
