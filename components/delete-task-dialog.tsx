"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { verifyPin } from "@/lib/tasks"
import { Loader2, AlertTriangle, Lock } from "lucide-react"

interface DeleteTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteTaskDialog({ open, onOpenChange, onConfirm }: DeleteTaskDialogProps) {
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  const handleConfirm = async () => {
    if (!pin) {
      setError("PIN tidak boleh kosong")
      return
    }

    setIsVerifying(true)
    try {
      const isValid = await verifyPin(pin)
      if (isValid) {
        onConfirm()
        setPin("")
        setError("")
      } else {
        setError("PIN tidak valid")
      }
    } catch (err) {
      console.error("Error verifying PIN:", err)
      setError("Terjadi kesalahan saat memverifikasi PIN")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleClose = () => {
    setPin("")
    setError("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] border-t-4 border-t-destructive animate-fade-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Hapus Tugas
          </DialogTitle>
          <DialogDescription>Masukkan PIN untuk mengkonfirmasi penghapusan tugas ini.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="pin" className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
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
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive animate-fade-in bg-destructive/10 p-2 rounded-md">{error}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isVerifying}>
            Batal
          </Button>
          <Button onClick={handleConfirm} disabled={isVerifying} className="bg-destructive hover:bg-destructive/90">
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memverifikasi...
              </>
            ) : (
              "Konfirmasi"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
