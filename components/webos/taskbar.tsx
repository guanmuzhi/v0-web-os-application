"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { WindowState } from "./desktop"
import { Search, Wifi, Volume2, Battery, ChevronUp } from "lucide-react"

interface TaskbarProps {
  windows: WindowState[]
  onWindowClick: (id: string) => void
  onAppOpen: (app: { id: string; title: string; icon: React.ReactNode; component: string }) => void
  apps: { id: string; title: string; icon: React.ReactNode; component: string }[]
}

export function Taskbar({ windows, onWindowClick, onAppOpen, apps }: TaskbarProps) {
  const [time, setTime] = useState(new Date())
  const [showStartMenu, setShowStartMenu] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" })
  }

  const pinnedApps = apps.slice(0, 5)

  return (
    <>
      {/* Start Menu */}
      {showStartMenu && (
        <div
          className="absolute bottom-14 left-2 w-80 bg-[oklch(0.15_0.01_250/0.95)] backdrop-blur-xl rounded-xl border border-border shadow-2xl overflow-hidden z-[9999]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索应用..."
                className="w-full bg-secondary/50 rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-3">所有应用</p>
            <div className="grid grid-cols-4 gap-3">
              {apps.map((app) => (
                <button
                  key={app.id}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                  onClick={() => {
                    onAppOpen(app)
                    setShowStartMenu(false)
                  }}
                >
                  <div className="text-primary">{app.icon}</div>
                  <span className="text-xs text-foreground truncate w-full text-center">{app.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-[oklch(0.12_0.01_250/0.90)] backdrop-blur-xl border-t border-border flex items-center px-2 gap-1 z-[9998]">
        {/* Start Button */}
        <button
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-lg transition-colors",
            showStartMenu ? "bg-primary/20" : "hover:bg-secondary/50",
          )}
          onClick={() => setShowStartMenu(!showStartMenu)}
        >
          <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
            <div className="bg-primary rounded-sm" />
            <div className="bg-primary rounded-sm" />
            <div className="bg-primary rounded-sm" />
            <div className="bg-primary rounded-sm" />
          </div>
        </button>

        {/* Pinned Apps */}
        <div className="flex items-center gap-1 px-2 border-l border-border ml-1">
          {pinnedApps.map((app) => {
            const isOpen = windows.some((w) => w.id === app.id)
            const isMinimized = windows.find((w) => w.id === app.id)?.isMinimized

            return (
              <button
                key={app.id}
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-lg transition-all relative",
                  isOpen ? "bg-secondary/70" : "hover:bg-secondary/50",
                )}
                onClick={() => (isOpen ? onWindowClick(app.id) : onAppOpen(app))}
              >
                <div className={cn("text-foreground", isMinimized && "opacity-50")}>{app.icon}</div>
                {isOpen && (
                  <div
                    className={cn(
                      "absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all",
                      isMinimized ? "w-1 bg-muted-foreground" : "w-4 bg-primary",
                    )}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Open Windows */}
        <div className="flex-1 flex items-center gap-1 px-2 overflow-x-auto">
          {windows
            .filter((w) => !pinnedApps.some((p) => p.id === w.id))
            .map((window) => (
              <button
                key={window.id}
                className={cn(
                  "h-9 px-3 flex items-center gap-2 rounded-lg transition-colors min-w-[120px] max-w-[200px]",
                  window.isMinimized ? "bg-secondary/30" : "bg-secondary/70",
                )}
                onClick={() => onWindowClick(window.id)}
              >
                <div className="w-4 h-4 flex-shrink-0">{window.icon}</div>
                <span className="text-sm text-foreground truncate">{window.title}</span>
              </button>
            ))}
        </div>

        {/* System Tray */}
        <div className="flex items-center gap-2 px-3 border-l border-border">
          <button className="p-1.5 hover:bg-secondary/50 rounded transition-colors">
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          </button>
          <Wifi className="w-4 h-4 text-foreground" />
          <Volume2 className="w-4 h-4 text-foreground" />
          <Battery className="w-4 h-4 text-foreground" />
        </div>

        {/* Clock */}
        <div className="flex flex-col items-end px-3 border-l border-border min-w-[70px]">
          <span className="text-xs text-foreground">{formatTime(time)}</span>
          <span className="text-xs text-muted-foreground">{formatDate(time)}</span>
        </div>
      </div>
    </>
  )
}
