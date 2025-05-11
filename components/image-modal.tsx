"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { X, ZoomIn, ZoomOut, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
}

export function ImageModal({ isOpen, onClose, imageUrl }: ImageModalProps) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)

  // Reset zoom and rotation when modal opens with a new image
  useEffect(() => {
    if (isOpen) {
      setScale(1)
      setRotation(0)
    }
  }, [isOpen, imageUrl])

  const zoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.25, 3))
  }

  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.25, 0.5))
  }

  const rotate = () => {
    setRotation((prevRotation) => (prevRotation + 90) % 360)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-black/90 border-none">
        <div className="relative w-full h-full flex flex-col">
          <div className="absolute top-2 right-2 z-10 flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full bg-black/50 border-none text-white hover:bg-black/70"
              onClick={zoomIn}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full bg-black/50 border-none text-white hover:bg-black/70"
              onClick={zoomOut}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full bg-black/50 border-none text-white hover:bg-black/70"
              onClick={rotate}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full bg-black/50 border-none text-white hover:bg-black/70"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            <div
              className="relative transition-transform duration-200 ease-in-out cursor-move"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
              }}
            >
              <img
                src={imageUrl || "/placeholder.svg"}
                alt="Gambar diperbesar"
                className="max-w-full max-h-[80vh] object-contain"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
