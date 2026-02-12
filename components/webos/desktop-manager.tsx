"use client"

import type React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import type { DesktopConfig } from "@/lib/webos-store"
import { createDesktop, deleteDesktop, getDefaultWallpapers } from "@/lib/webos-store"
import { Plus, X, Check, Monitor } from "lucide-react"

interface DesktopManagerProps {
  desktops: DesktopConfig[]
  currentDesktopId: string
  onSelectDesktop: (desktopId: string) => void
  onDesktopsChange: (desktops: DesktopConfig[]) => void
  onClose: () => void
}

export function DesktopManager({
  desktops,
  currentDesktopId,
  onSelectDesktop,
  onDesktopsChange,
  onClose,
}: DesktopManagerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newDesktopName, setNewDesktopName] = useState("")
  const [selectedWallpaper, setSelectedWallpaper] = useState(getDefaultWallpapers()[0])

  const handleCreateDesktop = () => {
    if (!newDesktopName.trim()) return
    const newDesktop = createDesktop(newDesktopName.trim(), selectedWallpaper)
    onDesktopsChange([...desktops, newDesktop])
    setNewDesktopName("")
    setIsCreating(false)
  }

  const handleDeleteDesktop = (desktopId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (desktops.length <= 1) return
    deleteDesktop(desktopId)
    const updatedDesktops = desktops.filter((d) => d.id !== desktopId)
    onDesktopsChange(updatedDesktops)
  }

  const wallpapers = getDefaultWallpapers()

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-4xl max-h-[80vh] bg-[oklch(0.15_0.01_250)] rounded-2xl border border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">桌面管理</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(80vh-80px)]">
          {/* Desktop Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {desktops.map((desktop) => (
              <div
                key={desktop.id}
                className="relative group"
              >
                <button
                  onClick={() => {
                    onSelectDesktop(desktop.id)
                    onClose()
                  }}
                  className={cn(
                    "w-full aspect-video rounded-xl overflow-hidden border-2 transition-all",
                    currentDesktopId === desktop.id
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-white/10 hover:border-white/30",
                  )}
                >
                  <div
                    className="w-full h-full relative"
                    style={{
                      backgroundImage: `url(${desktop.wallpaper})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {/* Miniature UI overlay */}
                    <div className="absolute inset-0 bg-black/20">
                      <div className="absolute top-0 left-0 right-0 h-2 bg-black/40" />
                      <div className="absolute left-0 top-2 bottom-0 w-3 bg-black/40" />
                    </div>

                    {/* Current indicator */}
                    {currentDesktopId === desktop.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>

                {/* Desktop name */}
                <p className="mt-2 text-sm text-white text-center truncate">{desktop.name}</p>

                {/* Delete button */}
                {desktops.length > 1 && (
                  <button
                    onClick={(e) => handleDeleteDesktop(desktop.id, e)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full items-center justify-center transition-all shadow-lg hidden group-hover:flex"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                )}
              </div>
            ))}

            {/* Add Desktop Button */}
            {!isCreating && (
              <button
                onClick={() => setIsCreating(true)}
                className="aspect-video rounded-xl border-2 border-dashed border-white/20 hover:border-white/40 flex flex-col items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-8 h-8 text-white/40" />
                <span className="text-sm text-white/40">新建桌面</span>
              </button>
            )}
          </div>

          {/* Create Desktop Form */}
          {isCreating && (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">创建新桌面</h3>

              {/* Name Input */}
              <div className="mb-4">
                <label className="block text-sm text-white/60 mb-2">桌面名称</label>
                <input
                  type="text"
                  value={newDesktopName}
                  onChange={(e) => setNewDesktopName(e.target.value)}
                  placeholder="输入桌面名称..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/40 transition-colors"
                  autoFocus
                />
              </div>

              {/* Wallpaper Selection */}
              <div className="mb-6">
                <label className="block text-sm text-white/60 mb-2">选择壁纸</label>
                <div className="grid grid-cols-3 gap-2">
                  {wallpapers.map((wp, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedWallpaper(wp)}
                      className={cn(
                        "aspect-video rounded-lg overflow-hidden border-2 transition-all",
                        selectedWallpaper === wp
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-white/10 hover:border-white/30",
                      )}
                    >
                      <img
                        src={wp || "/placeholder.svg"}
                        alt={`壁纸 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsCreating(false)
                    setNewDesktopName("")
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                  取消
                </button>
                <button
                  onClick={handleCreateDesktop}
                  disabled={!newDesktopName.trim()}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors",
                    newDesktopName.trim()
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-white/20 text-white/40 cursor-not-allowed",
                  )}
                >
                  <Monitor className="w-4 h-4" />
                  创建
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
