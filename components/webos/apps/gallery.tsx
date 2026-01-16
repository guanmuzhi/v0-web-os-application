"use client"

import { useState } from "react"
import { Grid, LayoutGrid, X, ChevronLeft, ChevronRight } from "lucide-react"

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
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="h-10 bg-secondary/30 border-b border-border flex items-center justify-between px-3">
        <span className="text-sm text-foreground">图库</span>
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded bg-secondary">
            <Grid className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded hover:bg-secondary/50 transition-colors">
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="grid grid-cols-3 gap-3">
          {images.map((image) => (
            <button
              key={image.id}
              className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all"
              onClick={() => openImage(image.id)}
            >
              <img
                src={`/.jpg?height=200&width=200&query=${encodeURIComponent(image.query)}`}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={closeImage}
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <button
            className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={() => navigateImage("prev")}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <img
            src={`/.jpg?height=600&width=800&query=${encodeURIComponent(images.find((img) => img.id === selectedImage)?.query || "")}`}
            alt=""
            className="max-w-[80%] max-h-[80%] object-contain rounded-lg"
          />

          <button
            className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={() => navigateImage("next")}
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      )}
    </div>
  )
}
