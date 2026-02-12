"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Wifi, Volume2, Battery, Grid3X3, Sun, BellOff } from "lucide-react"

interface SystemTrayProps {
  onShowDesktops?: () => void
  className?: string
}

export function SystemTray({ onShowDesktops, className }: SystemTrayProps) {
  const [time, setTime] = useState(new Date())
  const [showQuickSettings, setShowQuickSettings] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric", weekday: "short" })
  }

  return (
    <div className={cn("h-10 bg-black/30 backdrop-blur-xl flex items-center justify-between px-4", className)}>
      {/* Left - Desktop Button */}
      <div className="flex items-center gap-3">
        {onShowDesktops && (
          <button
            onClick={onShowDesktops}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="显示桌面"
          >
            <Grid3X3 className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {/* Right - System Icons & Clock */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowQuickSettings(!showQuickSettings)}
          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <Wifi className="w-4 h-4 text-white" />
          <Volume2 className="w-4 h-4 text-white" />
          <Battery className="w-4 h-4 text-white" />
        </button>

        <div className="flex items-center gap-2 px-2 py-1 rounded-lg text-white text-sm">
          <span>{formatDate(time)}</span>
          <span className="font-medium">{formatTime(time)}</span>
        </div>
      </div>

      {/* Quick Settings Dropdown */}
      {showQuickSettings && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowQuickSettings(false)} />
          <div className="absolute top-12 right-4 w-72 bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 p-4 z-50">
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: <Wifi className="w-5 h-5" />, label: "WiFi", active: true },
                { icon: <BellOff className="w-5 h-5" />, label: "勿扰", active: false },
                { icon: <Sun className="w-5 h-5" />, label: "夜间", active: false },
              ].map((item, i) => (
                <button
                  key={i}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl transition-colors",
                    item.active ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20",
                  )}
                >
                  {item.icon}
                  <span className="text-xs">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Volume Slider */}
            <div className="mt-4">
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-white" />
                <input
                  type="range"
                  className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
                  defaultValue={75}
                />
              </div>
            </div>

            {/* Brightness Slider */}
            <div className="mt-3">
              <div className="flex items-center gap-3">
                <Sun className="w-4 h-4 text-white" />
                <input
                  type="range"
                  className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
                  defaultValue={100}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
