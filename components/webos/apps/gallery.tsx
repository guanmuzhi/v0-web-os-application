"use client"

import { useState } from "react"
import { Grid, LayoutGrid, X, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const images = [
  { id: 1, query: "beautiful sunset over ocean landscape photography" },
  { id: 2, query: "mountain peak snow covered alpine scenery" },
  { id: 3, query: "colorful autumn forest nature photography" },
  { id: 4, query: "city skyline night lights urban photography" },
  { id: 5, query: "tropical beach palm trees paradise" },
  { id: 6, query: "northern lights aurora borealis sky" },
  { id: 7, query: "cherry blossom spring japan photography" },
  { id: 8, query: "desert sand dunes golden hour" },
  { id: 9, query: "waterfall rainforest nature scenery" },
]

export function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "large">("grid")

  const openImage = (id: number) => setSelectedImage(id)
  const closeImage = () => setSelectedImage(null)

  const navigateImage = (direction: "prev" | "next") => {
    if (selectedImage === null) return
    const currentIndex = images.findIndex((img) => img.id === selectedImage)
    if (direction === "prev" && currentIndex > 0) {
      setSelectedImage(images[currentIndex - 1].id)
    } else if (direction === "next" && currentIndex < images.length - 1) {
      setSelectedImage(images[currentIndex + 1].id)
    }
  }

  return (
    <div className="h-full flex flex-col bg-[oklch(0.12_0.01_250)]">
      {/* Toolbar */}
      <div className="h-10 bg-black/30 border-b border-white/10 flex items-center justify-between px-3">
        <span className="text-sm text-white">图库</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode("grid")}
            className={cn("p-1.5 rounded transition-colors", viewMode === "grid" ? "bg-white/10" : "hover:bg-white/10")}
          >
            <Grid className="w-4 h-4 text-white/70" />
          </button>
          <button
            onClick={() => setViewMode("large")}
            className={cn(
              "p-1.5 rounded transition-colors",
              viewMode === "large" ? "bg-white/10" : "hover:bg-white/10",
            )}
          >
            <LayoutGrid className="w-4 h-4 text-white/70" />
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="flex-1 p-4 overflow-auto">
        <div className={cn("grid gap-3", viewMode === "grid" ? "grid-cols-3" : "grid-cols-2")}>
          {images.map((image) => (
            <button
              key={image.id}
              className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all"
              onClick={() => openImage(image.id)}
            >
              <img
                src={`/.jpg?height=300&width=300&query=${encodeURIComponent(image.query)}`}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-50">
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={closeImage}
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <button
            className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30"
            onClick={() => navigateImage("prev")}
            disabled={images.findIndex((img) => img.id === selectedImage) === 0}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <img
            src={`/.jpg?height=600&width=800&query=${encodeURIComponent(images.find((img) => img.id === selectedImage)?.query || "")}`}
            alt=""
            className="max-w-[80%] max-h-[80%] object-contain rounded-lg"
          />

          <button
            className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30"
            onClick={() => navigateImage("next")}
            disabled={images.findIndex((img) => img.id === selectedImage) === images.length - 1}
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      )}
    </div>
  )
}
