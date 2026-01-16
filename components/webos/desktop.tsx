"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Taskbar } from "./taskbar"
import { Window } from "./window"
import { DesktopIcon } from "./desktop-icon"
import { ContextMenu } from "./context-menu"
import { Folder, Terminal, Settings, Globe, FileText, Calculator, ImageIcon, Music } from "lucide-react"

export interface WindowState {
  id: string
  title: string
  icon: React.ReactNode
  component: string
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  position: { x: number; y: number }
  size: { width: number; height: number }
}

const desktopApps = [
  { id: "files", title: "文件管理器", icon: <Folder className="w-8 h-8" />, component: "FileExplorer" },
  { id: "terminal", title: "终端", icon: <Terminal className="w-8 h-8" />, component: "TerminalApp" },
  { id: "browser", title: "浏览器", icon: <Globe className="w-8 h-8" />, component: "Browser" },
  { id: "settings", title: "设置", icon: <Settings className="w-8 h-8" />, component: "SettingsApp" },
  { id: "notepad", title: "记事本", icon: <FileText className="w-8 h-8" />, component: "Notepad" },
  { id: "calculator", title: "计算器", icon: <Calculator className="w-8 h-8" />, component: "CalculatorApp" },
  { id: "gallery", title: "图库", icon: <ImageIcon className="w-8 h-8" />, component: "Gallery" },
  { id: "music", title: "音乐", icon: <Music className="w-8 h-8" />, component: "MusicPlayer" },
]

export function Desktop() {
  const [windows, setWindows] = useState<WindowState[]>([])
  const [highestZIndex, setHighestZIndex] = useState(1)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  const openWindow = useCallback(
    (app: (typeof desktopApps)[0]) => {
      const existingWindow = windows.find((w) => w.id === app.id)

      if (existingWindow) {
        // Restore if minimized and bring to front
        setWindows((prev) =>
          prev.map((w) => (w.id === app.id ? { ...w, isMinimized: false, zIndex: highestZIndex + 1 } : w)),
        )
        setHighestZIndex((prev) => prev + 1)
        return
      }

      const newWindow: WindowState = {
        id: app.id,
        title: app.title,
        icon: app.icon,
        component: app.component,
        isMinimized: false,
        isMaximized: false,
        zIndex: highestZIndex + 1,
        position: { x: 100 + windows.length * 30, y: 80 + windows.length * 30 },
        size: { width: 800, height: 500 },
      }

      setWindows((prev) => [...prev, newWindow])
      setHighestZIndex((prev) => prev + 1)
    },
    [windows, highestZIndex],
  )

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id))
  }, [])

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)))
  }, [])

  const maximizeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)))
  }, [])

  const focusWindow = useCallback(
    (id: string) => {
      setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, zIndex: highestZIndex + 1 } : w)))
      setHighestZIndex((prev) => prev + 1)
    },
    [highestZIndex],
  )

  const updateWindowPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, position } : w)))
  }, [])

  const updateWindowSize = useCallback((id: string, size: { width: number; height: number }) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, size } : w)))
  }, [])

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const closeContextMenu = () => setContextMenu(null)

  return (
    <div
      className="h-screen w-screen overflow-hidden relative select-none"
      style={{
        backgroundImage: "url('/abstract-dark-blue-gradient-cosmic-wallpaper.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onContextMenu={handleContextMenu}
      onClick={closeContextMenu}
    >
      {/* Desktop Icons */}
      <div className="absolute inset-0 p-4 pb-16 grid grid-cols-[repeat(auto-fill,100px)] grid-rows-[repeat(auto-fill,100px)] gap-2 content-start">
        {desktopApps.map((app) => (
          <DesktopIcon key={app.id} icon={app.icon} label={app.title} onDoubleClick={() => openWindow(app)} />
        ))}
      </div>

      {/* Windows */}
      {windows.map((window) => (
        <Window
          key={window.id}
          window={window}
          onClose={() => closeWindow(window.id)}
          onMinimize={() => minimizeWindow(window.id)}
          onMaximize={() => maximizeWindow(window.id)}
          onFocus={() => focusWindow(window.id)}
          onPositionChange={(pos) => updateWindowPosition(window.id, pos)}
          onSizeChange={(size) => updateWindowSize(window.id, size)}
        />
      ))}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={closeContextMenu}
          onRefresh={() => window.location.reload()}
        />
      )}

      {/* Taskbar */}
      <Taskbar
        windows={windows}
        onWindowClick={(id) => {
          const win = windows.find((w) => w.id === id)
          if (win?.isMinimized) {
            setWindows((prev) =>
              prev.map((w) => (w.id === id ? { ...w, isMinimized: false, zIndex: highestZIndex + 1 } : w)),
            )
            setHighestZIndex((prev) => prev + 1)
          } else {
            focusWindow(id)
          }
        }}
        onAppOpen={openWindow}
        apps={desktopApps}
      />
    </div>
  )
}
