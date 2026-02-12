"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronUp, Lock } from "lucide-react"

interface LockScreenProps {
  wallpaper: string
  onUnlock: () => void
  pixelEffect?: boolean
}

export function LockScreen({ wallpaper, onUnlock, pixelEffect }: LockScreenProps) {
  const [time, setTime] = useState(new Date())
  const [isDragging, setIsDragging] = useState(false)
  const [dragProgress, setDragProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("zh-CN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleTouchStart = () => setIsDragging(true)

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
    const windowHeight = window.innerHeight
    const progress = Math.max(0, Math.min(1, 1 - clientY / windowHeight))
    setDragProgress(progress)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    if (dragProgress > 0.3) {
      onUnlock()
    }
    setDragProgress(0)
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-[10000] flex flex-col items-center justify-center select-none transition-transform duration-300",
        pixelEffect && "pixel-effect",
      )}
      style={{
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transform: `translateY(-${dragProgress * 100}%)`,
      }}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-white">
        {/* Time */}
        <div className={cn("text-8xl md:text-9xl font-light tracking-tight mb-2", pixelEffect && "font-mono")}>
          {formatTime(time)}
        </div>

        {/* Date */}
        <div className="text-xl md:text-2xl font-light opacity-90">{formatDate(time)}</div>
      </div>

      {/* Unlock indicator */}
      <div className="absolute bottom-12 flex flex-col items-center text-white/80 animate-bounce">
        <ChevronUp className="w-8 h-8" />
        <div className="flex items-center gap-2 mt-2">
          <Lock className="w-4 h-4" />
          <span className="text-sm">上滑解锁</span>
        </div>
      </div>

      {/* Progress indicator */}
      {dragProgress > 0 && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1 bg-white/50"
          style={{ transform: `scaleX(${dragProgress})`, transformOrigin: "left" }}
        />
      )}
    </div>
  )
}
