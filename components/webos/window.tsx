"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { WindowState } from "@/lib/webos-store"
import { X, Minus, Square, Maximize2 } from "lucide-react"
import { FileExplorer } from "./apps/file-explorer"
import { TerminalApp } from "./apps/terminal"
import { Browser } from "./apps/browser"
import { SettingsApp } from "./apps/settings"
import { Notepad } from "./apps/notepad"
import { CalculatorApp } from "./apps/calculator"
import { Gallery } from "./apps/gallery"
import { MusicPlayer } from "./apps/music-player"
import { HtmlRunner } from "./apps/html-runner"

interface WindowProps {
  window: WindowState
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onFocus: () => void
  onPositionChange: (position: { x: number; y: number }) => void
  onSizeChange: (size: { width: number; height: number }) => void
  isMobile?: boolean
}

const appComponents: Record<string, React.ComponentType<{ windowProps?: Record<string, unknown> }>> = {
  FileExplorer,
  TerminalApp,
  Browser,
  SettingsApp,
  Notepad,
  CalculatorApp,
  Gallery,
  MusicPlayer,
  HtmlRunner,
}

export function Window({
  window,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onPositionChange,
  onSizeChange,
  isMobile,
}: WindowProps) {
  const windowRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const AppComponent = appComponents[window.component]

  useEffect(() => {
    if (isMobile) return

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        onPositionChange({
          x: e.clientX - dragOffset.x,
          y: Math.max(40, e.clientY - dragOffset.y), // Account for system tray
        })
      }
      if (isResizing && windowRef.current) {
        const rect = windowRef.current.getBoundingClientRect()
        onSizeChange({
          width: Math.max(400, e.clientX - rect.left),
          height: Math.max(300, e.clientY - rect.top),
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, isResizing, dragOffset, onPositionChange, onSizeChange, isMobile])

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return // Disable drag on mobile
    if ((e.target as HTMLElement).closest("button")) return
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - window.position.x,
      y: e.clientY - window.position.y,
    })
    onFocus()
  }

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return // Disable resize on mobile
    e.stopPropagation()
    setIsResizing(true)
    onFocus()
  }

  if (window.isMinimized) return null

  const isEffectivelyMaximized = isMobile || window.isMaximized

  return (
    <div
      ref={windowRef}
      className={cn(
        "absolute bg-[oklch(0.14_0.01_250/0.95)] backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col",
        isDragging && "cursor-grabbing",
        "transition-shadow duration-200",
        "animate-in fade-in zoom-in-95 duration-200",
      )}
      style={{
        left: isEffectivelyMaximized ? (isMobile ? 0 : 64) : window.position.x,
        top: isEffectivelyMaximized ? 40 : window.position.y,
        width: isEffectivelyMaximized ? (isMobile ? "100%" : "calc(100% - 64px)") : window.size.width,
        height: isEffectivelyMaximized
          ? isMobile
            ? "calc(100% - 40px - 64px)"
            : "calc(100% - 40px)"
          : window.size.height,
        zIndex: window.zIndex,
      }}
      onMouseDown={onFocus}
    >
      {/* Title Bar */}
      <div
        className={cn(
          "h-10 bg-black/40 flex items-center justify-between px-3 select-none flex-shrink-0",
          !isMobile && "cursor-grab",
        )}
        onMouseDown={handleHeaderMouseDown}
        onDoubleClick={!isMobile ? onMaximize : undefined}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center text-white [&>svg]:w-4 [&>svg]:h-4">
            {window.icon}
          </div>
          <span className="text-sm text-white font-medium truncate max-w-[200px]">{window.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
            onClick={onMinimize}
          >
            <Minus className="w-4 h-4 text-white/70" />
          </button>
          {!isMobile && (
            <button
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
              onClick={onMaximize}
            >
              {window.isMaximized ? (
                <Square className="w-3.5 h-3.5 text-white/70" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 text-white/70" />
              )}
            </button>
          )}
          <button
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-500/80 transition-colors group"
            onClick={onClose}
          >
            <X className="w-4 h-4 text-white/70 group-hover:text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">{AppComponent && <AppComponent windowProps={window.props} />}</div>

      {/* Resize Handle - Desktop only */}
      {!isEffectivelyMaximized && !isMobile && (
        <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize" onMouseDown={handleResizeMouseDown} />
      )}
    </div>
  )
}
