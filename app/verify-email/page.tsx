"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { verifySubscriber } from "@/lib/subscribers"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [isVerifying, setIsVerifying] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError("Token verifikasi tidak ditemukan")
        setIsVerifying(false)
        return
      }

      try {
        const result = await verifySubscriber(token)
        if (result.success) {
          setIsSuccess(true)
        } else {
          setError(result.error?.message || "Token verifikasi tidak valid atau sudah kadaluarsa")
        }
      } catch (err) {
        console.error("Error verifying email:", err)
        setError("Terjadi kesalahan saat memverifikasi email")
      } finally {
        setIsVerifying(false)
      }
    }

    verifyEmail()
  }, [token])

  return (
    <div className="container mx-auto px-4 py-8 page-transition">
      <Card className="max-w-md mx-auto border-t-4 border-t-primary animate-fade-in shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">Verifikasi Email</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6 text-center">
          {isVerifying ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p>Memverifikasi email Anda...</p>
            </div>
          ) : isSuccess ? (
            <div className="flex flex-col items-center animate-fade-in">
              <div className="mb-4 rounded-full bg-green-100 p-3">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold">Email Berhasil Diverifikasi!</h2>
              <p className="text-muted-foreground mt-2 mb-6">
                Anda akan menerima notifikasi email saat ada tugas baru atau pengingat H-1 sebelum tugas jatuh tempo.
              </p>
              <Link href="/">
                <Button className="bg-primary hover:bg-primary/90">Kembali ke Beranda</Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center animate-fade-in">
              <div className="mb-4 rounded-full bg-red-100 p-3">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold">Verifikasi Gagal</h2>
              <p className="text-muted-foreground mt-2 mb-6">{error}</p>
              <Link href="/subscribe">
                <Button className="bg-primary hover:bg-primary/90">Coba Lagi</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
