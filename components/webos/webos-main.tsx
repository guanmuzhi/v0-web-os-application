"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  getSettings,
  saveSettings,
  switchUser,
  switchDesktop,
  type AppDefinition,
  type WindowState,
  type WebOSSettings,
  type UserProfile,
  type DesktopConfig,
} from "@/lib/webos-store"
import { LockScreen } from "./lock-screen"
import { UserSelectScreen } from "./user-select-screen"
import { WelcomeScreen } from "./welcome-screen"
import { SystemTray } from "./system-tray"
import { Dock } from "./dock"
import { Window } from "./window"
import { DesktopIcon } from "./desktop-icon"
import { ContextMenu } from "./context-menu"
import { DesktopManager } from "./desktop-manager"
import { Folder, Terminal, Settings, Globe, FileText, Calculator, ImageIcon, Music, Code } from "lucide-react"

type ScreenState = "locked" | "userSelect" | "welcome" | "desktop"

const defaultApps: AppDefinition[] = [
  {
    id: "files",
    title: "文件管理器",
    icon: <Folder className="w-6 h-6" />,
    component: "FileExplorer",
    category: "system",
  },
  {
    id: "terminal",
    title: "终端",
    icon: <Terminal className="w-6 h-6" />,
    component: "TerminalApp",
    category: "system",
  },
  {
    id: "browser",
    title: "浏览器",
    icon: <Globe className="w-6 h-6" />,
    component: "Browser",
    category: "productivity",
  },
  {
    id: "settings",
    title: "设置",
    icon: <Settings className="w-6 h-6" />,
    component: "SettingsApp",
    category: "system",
  },
  {
    id: "notepad",
    title: "记事本",
    icon: <FileText className="w-6 h-6" />,
    component: "Notepad",
    category: "productivity",
  },
  {
    id: "calculator",
    title: "计算器",
    icon: <Calculator className="w-6 h-6" />,
    component: "CalculatorApp",
    category: "utilities",
  },
  {
    id: "gallery",
    title: "图库",
    icon: <ImageIcon className="w-6 h-6" />,
    component: "Gallery",
    category: "media",
  },
  {
    id: "music",
    title: "音乐",
    icon: <Music className="w-6 h-6" />,
    component: "MusicPlayer",
    category: "media",
  },
  {
    id: "htmlrunner",
    title: "HTML运行器",
    icon: <Code className="w-6 h-6" />,
    component: "HtmlRunner",
    category: "utilities",
  },
]

const pinnedAppIds = ["files", "browser", "terminal", "settings", "notepad"]

export function WebOSMain() {
  const [screenState, setScreenState] = useState<ScreenState>("locked")
  const [settings, setSettings] = useState<WebOSSettings>(getSettings)
  const [windows, setWindows] = useState<WindowState[]>([])
  const [highestZIndex, setHighestZIndex] = useState(100)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showDesktopManager, setShowDesktopManager] = useState(false)

  // Initialize and detect mobile
  useEffect(() => {
    const init = async () => {
      setIsInitialized(true)
    }
    init()

    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)

    // Listen for settings changes
    const handleSettingsChange = (e: CustomEvent<WebOSSettings>) => {
      setSettings(e.detail)
    }
    window.addEventListener("webos-settings-change", handleSettingsChange as EventListener)

    return () => {
      window.removeEventListener("resize", checkMobile)
      window.removeEventListener("webos-settings-change", handleSettingsChange as EventListener)
    }
  }, [])

  // Handle user selection
  const handleSelectUser = useCallback((userId: string) => {
    const updated = switchUser(userId)
    setSettings(updated)
    setScreenState("welcome")
  }, [])

  // Handle users change
  const handleUsersChange = useCallback((users: UserProfile[]) => {
    const updated = saveSettings({ users })
    setSettings(updated)
  }, [])

  // Handle desktop selection
  const handleSelectDesktop = useCallback((desktopId: string) => {
    const updated = switchDesktop(desktopId)
    setSettings(updated)
    window.dispatchEvent(new CustomEvent("webos-settings-change", { detail: updated }))
  }, [])

  // Handle desktops change
  const handleDesktopsChange = useCallback((desktops: DesktopConfig[]) => {
    const updated = saveSettings({ desktops })
    setSettings(updated)
  }, [])

  const openWindow = useCallback(
    (app: AppDefinition, props?: Record<string, unknown>) => {
      const existingWindow = windows.find((w) => w.appId === app.id && !props)

      if (existingWindow) {
        setWindows((prev) =>
          prev.map((w) => (w.id === existingWindow.id ? { ...w, isMinimized: false, zIndex: highestZIndex + 1 } : w))
        )
        setHighestZIndex((prev) => prev + 1)
        return
      }

      const windowId = `${app.id}-${Date.now()}`
      const newWindow: WindowState = {
        id: windowId,
        appId: app.id,
        title: app.title,
        icon: app.icon,
        component: app.component,
        isMinimized: false,
        isMaximized: isMobile,
        zIndex: highestZIndex + 1,
        position: { x: 100 + (windows.length % 5) * 40, y: 80 + (windows.length % 5) * 40 },
        size: { width: 900, height: 600 },
        props,
      }

      setWindows((prev) => [...prev, newWindow])
      setHighestZIndex((prev) => prev + 1)

      // Auto switch to desktop if opening from welcome screen
      if (screenState === "welcome") {
        setScreenState("desktop")
      }
    },
    [windows, highestZIndex, isMobile, screenState]
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
    [highestZIndex]
  )

  const handleWindowClick = useCallback(
    (windowId: string) => {
      const win = windows.find((w) => w.id === windowId)
      if (win?.isMinimized) {
        setWindows((prev) =>
          prev.map((w) => (w.id === windowId ? { ...w, isMinimized: false, zIndex: highestZIndex + 1 } : w))
        )
        setHighestZIndex((prev) => prev + 1)
      } else {
        focusWindow(windowId)
      }
    },
    [windows, highestZIndex, focusWindow]
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

  const handleLock = useCallback(() => {
    setScreenState("locked")
  }, [])

  // Get current desktop config
  const currentDesktop = settings.desktops.find((d) => d.id === settings.currentDesktopId) || settings.desktops[0]
  const currentWallpaper = currentDesktop?.wallpaper || settings.wallpaper

  // Determine dock position based on settings and device
  const dockAtBottom = isMobile || settings.dockPosition === "bottom"

  if (!isInitialized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl animate-pulse">WebOS 正在启动...</div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "h-screen w-screen overflow-hidden relative",
        settings.pixelEffect && "pixel-effect",
        settings.animations && "animate-enabled"
      )}
    >
      {/* Lock Screen */}
      {screenState === "locked" && (
        <LockScreen
          wallpaper={currentWallpaper}
          onUnlock={() => setScreenState("userSelect")}
          pixelEffect={settings.pixelEffect}
        />
      )}

      {/* User Select Screen */}
      {screenState === "userSelect" && (
        <UserSelectScreen
          users={settings.users}
          wallpaper={currentWallpaper}
          pixelEffect={settings.pixelEffect}
          onSelectUser={handleSelectUser}
          onUsersChange={handleUsersChange}
        />
      )}

      {/* Welcome Screen */}
      {screenState === "welcome" && (
        <WelcomeScreen
          apps={defaultApps}
          onAppOpen={openWindow}
          onEnterDesktop={() => setScreenState("desktop")}
          wallpaper={currentWallpaper}
          userName={settings.userName}
          pixelEffect={settings.pixelEffect}
          desktops={settings.desktops}
          currentDesktopId={settings.currentDesktopId}
          onSelectDesktop={handleSelectDesktop}
          onManageDesktops={() => setShowDesktopManager(true)}
        />
      )}

      {/* Desktop */}
      {screenState === "desktop" && (
        <div
          className={cn("h-full w-full flex", dockAtBottom ? "flex-col" : "flex-col")}
          style={{
            backgroundImage: `url(${currentWallpaper})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* System Tray - Top */}
          <SystemTray
            onShowDesktops={() => setScreenState("welcome")}
            onLock={handleLock}
            onManageDesktops={() => setShowDesktopManager(true)}
            desktops={settings.desktops}
            currentDesktopId={settings.currentDesktopId}
            onSelectDesktop={handleSelectDesktop}
          />

          {/* Main Area */}
          <div className={cn("flex-1 flex overflow-hidden", dockAtBottom ? "flex-col" : "flex-row")}>
            {/* Dock - Left or Bottom */}
            {!dockAtBottom && (
              <Dock
                apps={defaultApps}
                windows={windows}
                pinnedAppIds={pinnedAppIds}
                onAppClick={openWindow}
                onWindowClick={handleWindowClick}
                onShowAllApps={() => setScreenState("welcome")}
                isMobile={false}
              />
            )}

            {/* Desktop Area */}
            <div className="flex-1 relative" onContextMenu={handleContextMenu} onClick={closeContextMenu}>
              {/* Desktop Icons */}
              {!isMobile && (
                <div className="absolute inset-0 p-4 grid grid-cols-[repeat(auto-fill,80px)] grid-rows-[repeat(auto-fill,90px)] gap-2 content-start">
                  {defaultApps.slice(0, 6).map((app) => (
                    <DesktopIcon key={app.id} icon={app.icon} label={app.title} onDoubleClick={() => openWindow(app)} />
                  ))}
                </div>
              )}

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
                  isMobile={isMobile}
                />
              ))}

              {/* Context Menu */}
              {contextMenu && (
                <ContextMenu
                  x={contextMenu.x}
                  y={contextMenu.y}
                  onClose={closeContextMenu}
                  onRefresh={() => window.location.reload()}
                  onManageDesktops={() => {
                    setShowDesktopManager(true)
                    closeContextMenu()
                  }}
                />
              )}
            </div>

            {/* Mobile Dock - Bottom */}
            {dockAtBottom && (
              <Dock
                apps={defaultApps}
                windows={windows}
                pinnedAppIds={pinnedAppIds}
                onAppClick={openWindow}
                onWindowClick={handleWindowClick}
                onShowAllApps={() => setScreenState("welcome")}
                isMobile={true}
              />
            )}
          </div>
        </div>
      )}

      {/* Desktop Manager Modal */}
      {showDesktopManager && (
        <DesktopManager
          desktops={settings.desktops}
          currentDesktopId={settings.currentDesktopId}
          onSelectDesktop={handleSelectDesktop}
          onDesktopsChange={handleDesktopsChange}
          onClose={() => setShowDesktopManager(false)}
        />
      )}
    </div>
  )
}
