"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { WindowState } from "./desktop"
import { X, Minus, Square, Maximize2 } from "lucide-react"
import { FileExplorer } from "./apps/file-explorer"
import { TerminalApp } from "./apps/terminal"
import { Browser } from "./apps/browser"
import { SettingsApp } from "./apps/settings"
import { Notepad } from "./apps/notepad"
import { CalculatorApp } from "./apps/calculator"
import { Gallery } from "./apps/gallery"
import { MusicPlayer } from "./apps/music-player"

interface WindowProps {
  window: WindowState
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onFocus: () => void
  onPositionChange: (position: { x: number; y: number }) => void
  onSizeChange: (size: { width: number; height: number }) => void
}

const appComponents: Record<string, React.ComponentType> = {
  FileExplorer,
  TerminalApp,
  Browser,
  SettingsApp,
  Notepad,
  CalculatorApp,
  Gallery,
  MusicPlayer,
}

export function Window({
  window,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onPositionChange,
  onSizeChange,
}: WindowProps) {
  const windowRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const AppComponent = appComponents[window.component]

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        onPositionChange({
          x: e.clientX - dragOffset.x,
          y: Math.max(0, e.clientY - dragOffset.y),
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
  }, [isDragging, isResizing, dragOffset, onPositionChange, onSizeChange])

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - window.position.x,
      y: e.clientY - window.position.y,
    })
    onFocus()
  }

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizing(true)
    onFocus()
  }

  if (window.isMinimized) return null

  return (
    <div
      ref={windowRef}
      className={cn(
        "absolute bg-[oklch(0.16_0.01_250/0.95)] backdrop-blur-xl rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col",
        isDragging && "cursor-grabbing",
        "transition-shadow duration-200",
      )}
      style={{
        left: window.isMaximized ? 0 : window.position.x,
        top: window.isMaximized ? 0 : window.position.y,
        width: window.isMaximized ? "100%" : window.size.width,
        height: window.isMaximized ? "calc(100% - 48px)" : window.size.height,
        zIndex: window.zIndex,
      }}
      onMouseDown={onFocus}
    >
      {/* Title Bar */}
      <div
        className="h-10 bg-[oklch(0.20_0.01_250)] flex items-center justify-between px-3 cursor-grab select-none flex-shrink-0"
        onMouseDown={handleHeaderMouseDown}
        onDoubleClick={onMaximize}
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4">{window.icon}</div>
          <span className="text-sm text-foreground font-medium">{window.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-secondary/50 transition-colors"
            onClick={onMinimize}
          >
            <Minus className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-secondary/50 transition-colors"
            onClick={onMaximize}
          >
            {window.isMaximized ? (
              <Square className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>
          <button
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-destructive/80 transition-colors group"
            onClick={onClose}
          >
            <X className="w-4 h-4 text-muted-foreground group-hover:text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">{AppComponent && <AppComponent />}</div>

      {/* Resize Handle */}
      {!window.isMaximized && (
        <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize" onMouseDown={handleResizeMouseDown} />
      )}
    </div>
  )
}
