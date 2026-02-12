"use client"

import React from "react"

import { useState, useEffect, useCallback } from "react"
import { Grid, LayoutGrid, X, ChevronLeft, ChevronRight, Upload, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { fileList, fileCreate, fileDelete, wallpaperListAll, type VirtualFile } from "@/lib/webos-api"

export function Gallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "large">("grid")
  const [images, setImages] = useState<{ id: string; src: string; name: string }[]>([])

  const loadImages = useCallback(async () => {
    // Load from wallpapers + pictures folder
    const wallpapers = wallpaperListAll()
    const wallpaperImages = wallpapers.map((w, i) => ({ id: `wp-${i}`, src: w, name: `壁纸 ${i + 1}` }))

    const pictureFiles = await fileList("pictures")
    const fileImages = pictureFiles
      .filter((f) => f.type === "file" && f.content && (f.mimeType?.startsWith("image/") || f.name.match(/\.(png|jpg|jpeg|gif|webp)$/i)))
      .map((f) => ({ id: f.id, src: f.content || "", name: f.name }))

    setImages([...wallpaperImages, ...fileImages])
  }, [])

  useEffect(() => { loadImages() }, [loadImages])

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      await fileCreate({ name: file.name, type: "file", parentId: "pictures", content: dataUrl, mimeType: file.type, size: file.size })
      loadImages()
    }
    reader.readAsDataURL(file)
  }

  const handleDelete = async (id: string) => {
    if (id.startsWith("wp-")) return // cannot delete wallpapers from here
    if (!confirm("确定删除此图片?")) return
    await fileDelete(id)
    loadImages()
    setSelectedImage(null)
  }

  const currentIndex = selectedImage ? images.findIndex((img) => img.id === selectedImage) : -1

  const navigateImage = (direction: "prev" | "next") => {
    if (currentIndex === -1) return
    if (direction === "prev" && currentIndex > 0) setSelectedImage(images[currentIndex - 1].id)
    else if (direction === "next" && currentIndex < images.length - 1) setSelectedImage(images[currentIndex + 1].id)
  }

  return (
    <div className="h-full flex flex-col bg-[oklch(0.12_0.01_250)]">
      {/* Toolbar */}
      <div className="h-10 bg-black/30 border-b border-white/10 flex items-center justify-between px-3">
        <span className="text-sm text-white">图库 ({images.length})</span>
        <div className="flex items-center gap-1">
          <label className="p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer" title="上传图片">
            <Upload className="w-4 h-4 text-white/70" />
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>
          <div className="w-px h-4 bg-white/20 mx-1" />
          <button onClick={() => setViewMode("grid")} className={cn("p-1.5 rounded transition-colors", viewMode === "grid" ? "bg-white/10" : "hover:bg-white/10")}><Grid className="w-4 h-4 text-white/70" /></button>
          <button onClick={() => setViewMode("large")} className={cn("p-1.5 rounded transition-colors", viewMode === "large" ? "bg-white/10" : "hover:bg-white/10")}><LayoutGrid className="w-4 h-4 text-white/70" /></button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="flex-1 p-4 overflow-auto">
        {images.length === 0 ? (
          <div className="h-full flex items-center justify-center text-white/40">没有图片，上传一张吧</div>
        ) : (
          <div className={cn("grid gap-3", viewMode === "grid" ? "grid-cols-3" : "grid-cols-2")}>
            {images.map((image) => (
              <button key={image.id} className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all" onClick={() => setSelectedImage(image.id)}>
                <img src={image.src || "/placeholder.svg"} alt={image.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage !== null && currentIndex !== -1 && (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-50">
          <button className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" onClick={() => setSelectedImage(null)}><X className="w-6 h-6 text-white" /></button>
          {!images[currentIndex].id.startsWith("wp-") && (
            <button className="absolute top-4 right-16 p-2 rounded-full bg-white/10 hover:bg-red-500/50 transition-colors" onClick={() => handleDelete(images[currentIndex].id)}><Trash2 className="w-6 h-6 text-white" /></button>
          )}
          <button className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30" onClick={() => navigateImage("prev")} disabled={currentIndex === 0}><ChevronLeft className="w-6 h-6 text-white" /></button>
          <img src={images[currentIndex]?.src || "/placeholder.svg"} alt="" className="max-w-[80%] max-h-[80%] object-contain rounded-lg" />
          <button className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30" onClick={() => navigateImage("next")} disabled={currentIndex === images.length - 1}><ChevronRight className="w-6 h-6 text-white" /></button>
          <div className="absolute bottom-4 text-sm text-white/60">{images[currentIndex]?.name}</div>
        </div>
      )}
    </div>
  )
}
