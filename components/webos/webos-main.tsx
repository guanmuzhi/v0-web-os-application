"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  settingsGet,
  settingsSave,
  userSwitch,
  desktopSwitch,
  isMobileDevice,
  type AppDefinition,
  type WindowState,
  type WebOSSettings,
  type UserProfile,
  type DesktopConfig,
} from "@/lib/webos-api"
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
  { id: "files", title: "文件管理器", icon: <Folder className="w-6 h-6" />, component: "FileExplorer", category: "system" },
  { id: "terminal", title: "终端", icon: <Terminal className="w-6 h-6" />, component: "TerminalApp", category: "system" },
  { id: "browser", title: "浏览器", icon: <Globe className="w-6 h-6" />, component: "Browser", category: "productivity" },
  { id: "settings", title: "设置", icon: <Settings className="w-6 h-6" />, component: "SettingsApp", category: "system" },
  { id: "notepad", title: "记事本", icon: <FileText className="w-6 h-6" />, component: "Notepad", category: "productivity" },
  { id: "calculator", title: "计算器", icon: <Calculator className="w-6 h-6" />, component: "CalculatorApp", category: "utilities" },
  { id: "gallery", title: "图库", icon: <ImageIcon className="w-6 h-6" />, component: "Gallery", category: "media" },
  { id: "music", title: "音乐", icon: <Music className="w-6 h-6" />, component: "MusicPlayer", category: "media" },
  { id: "htmlrunner", title: "HTML运行器", icon: <Code className="w-6 h-6" />, component: "HtmlRunner", category: "utilities" },
]

const pinnedAppIds = ["files", "browser", "terminal", "settings", "notepad"]

export function WebOSMain() {
  const [screenState, setScreenState] = useState<ScreenState>("locked")
  const [settings, setSettings] = useState<WebOSSettings>(settingsGet)
  const [windows, setWindows] = useState<WindowState[]>([])
  const [highestZIndex, setHighestZIndex] = useState(100)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showDesktopManager, setShowDesktopManager] = useState(false)

  useEffect(() => {
    setIsInitialized(true)
    const checkMobile = () => setIsMobile(isMobileDevice())
    checkMobile()
    window.addEventListener("resize", checkMobile)

    const handleSettingsChange = (e: CustomEvent<WebOSSettings>) => setSettings(e.detail)
    window.addEventListener("webos-settings-change", handleSettingsChange as EventListener)

    // Listen for app open events from other components via the API
    const handleOpenApp = (e: CustomEvent<{ appId: string; props?: Record<string, unknown> }>) => {
      const app = defaultApps.find((a) => a.id === e.detail.appId)
      if (app) openWindowDirect(app, e.detail.props)
    }
    window.addEventListener("webos-open-app", handleOpenApp as EventListener)

    const handleOpenHtml = (e: CustomEvent<{ content: string; fileName: string }>) => {
      const app = defaultApps.find((a) => a.id === "htmlrunner")
      if (app) openWindowDirect(app, { htmlContent: e.detail.content, fileName: e.detail.fileName })
    }
    window.addEventListener("webos-open-html", handleOpenHtml as EventListener)

    const handleLock = () => setScreenState("locked")
    window.addEventListener("webos-lock", handleLock)

    const handleShowWelcome = () => setScreenState("welcome")
    window.addEventListener("webos-show-welcome", handleShowWelcome)

    const handleShowDM = () => setShowDesktopManager(true)
    window.addEventListener("webos-show-desktop-manager", handleShowDM)

    return () => {
      window.removeEventListener("resize", checkMobile)
      window.removeEventListener("webos-settings-change", handleSettingsChange as EventListener)
      window.removeEventListener("webos-open-app", handleOpenApp as EventListener)
      window.removeEventListener("webos-open-html", handleOpenHtml as EventListener)
      window.removeEventListener("webos-lock", handleLock)
      window.removeEventListener("webos-show-welcome", handleShowWelcome)
      window.removeEventListener("webos-show-desktop-manager", handleShowDM)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // A stable version of openWindow that doesn't depend on state in the closure for event listeners
  const openWindowDirect = (app: AppDefinition, props?: Record<string, unknown>) => {
    setWindows((prev) => {
      if (!props) {
        const existing = prev.find((w) => w.appId === app.id)
        if (existing) {
          setHighestZIndex((z) => z + 1)
          return prev.map((w) => w.id === existing.id ? { ...w, isMinimized: false, zIndex: 9999 } : w)
        }
      }
      const windowId = `${app.id}-${Date.now()}`
      setHighestZIndex((z) => z + 1)
      return [...prev, {
        id: windowId, appId: app.id, title: app.title, icon: app.icon,
        component: app.component, isMinimized: false, isMaximized: isMobileDevice(),
        zIndex: 9999, position: { x: 100 + (prev.length % 5) * 40, y: 80 + (prev.length % 5) * 40 },
        size: { width: 900, height: 600 }, props,
      }]
    })
    setScreenState("desktop")
  }

  const openWindow = useCallback((app: AppDefinition, props?: Record<string, unknown>) => {
    openWindowDirect(app, props)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile])

  const closeWindow = useCallback((id: string) => setWindows((prev) => prev.filter((w) => w.id !== id)), [])
  const minimizeWindow = useCallback((id: string) => setWindows((prev) => prev.map((w) => w.id === id ? { ...w, isMinimized: true } : w)), [])
  const maximizeWindow = useCallback((id: string) => setWindows((prev) => prev.map((w) => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)), [])

  const focusWindow = useCallback((id: string) => {
    setHighestZIndex((z) => {
      setWindows((prev) => prev.map((w) => w.id === id ? { ...w, zIndex: z + 1 } : w))
      return z + 1
    })
  }, [])

  const handleWindowClick = useCallback((windowId: string) => {
    setWindows((prev) => {
      const win = prev.find((w) => w.id === windowId)
      if (win?.isMinimized) {
        setHighestZIndex((z) => z + 1)
        return prev.map((w) => w.id === windowId ? { ...w, isMinimized: false, zIndex: 9999 } : w)
      }
      return prev
    })
    focusWindow(windowId)
  }, [focusWindow])

  const updateWindowPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setWindows((prev) => prev.map((w) => w.id === id ? { ...w, position } : w))
  }, [])

  const updateWindowSize = useCallback((id: string, size: { width: number; height: number }) => {
    setWindows((prev) => prev.map((w) => w.id === id ? { ...w, size } : w))
  }, [])

  const handleSelectUser = useCallback((userId: string) => {
    const updated = userSwitch(userId)
    setSettings(updated)
    setScreenState("welcome")
  }, [])

  const handleUsersChange = useCallback((users: UserProfile[]) => {
    const updated = settingsSave({ users })
    setSettings(updated)
  }, [])

  const handleSelectDesktop = useCallback((desktopId: string) => {
    const updated = desktopSwitch(desktopId)
    setSettings(updated)
  }, [])

  const handleDesktopsChange = useCallback((desktops: DesktopConfig[]) => {
    const updated = settingsSave({ desktops })
    setSettings(updated)
  }, [])

  const handleContextMenu = (e: React.MouseEvent) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY }) }
  const closeContextMenu = () => setContextMenu(null)
  const handleLock = useCallback(() => setScreenState("locked"), [])

  const currentDesktop = settings.desktops.find((d) => d.id === settings.currentDesktopId) || settings.desktops[0]
  const currentWallpaper = currentDesktop?.wallpaper || settings.wallpaper
  const dockAtBottom = isMobile || settings.dockPosition === "bottom"

  if (!isInitialized) {
    return <div className="h-screen w-screen flex items-center justify-center bg-black"><div className="text-white text-xl animate-pulse">WebOS</div></div>
  }

  return (
    <div className={cn("h-screen w-screen overflow-hidden relative", settings.pixelEffect && "pixel-effect", settings.animations && "animate-enabled")}>
      {screenState === "locked" && <LockScreen wallpaper={currentWallpaper} onUnlock={() => setScreenState("userSelect")} pixelEffect={settings.pixelEffect} />}

      {screenState === "userSelect" && <UserSelectScreen users={settings.users} wallpaper={currentWallpaper} pixelEffect={settings.pixelEffect} onSelectUser={handleSelectUser} onUsersChange={handleUsersChange} />}

      {screenState === "welcome" && (
        <WelcomeScreen apps={defaultApps} onAppOpen={openWindow} onEnterDesktop={() => setScreenState("desktop")} wallpaper={currentWallpaper} userName={settings.userName} pixelEffect={settings.pixelEffect} desktops={settings.desktops} currentDesktopId={settings.currentDesktopId} onSelectDesktop={handleSelectDesktop} onManageDesktops={() => setShowDesktopManager(true)} />
      )}

      {screenState === "desktop" && (
        <div className={cn("h-full w-full flex", dockAtBottom ? "flex-col" : "flex-col")} style={{ backgroundImage: `url(${currentWallpaper})`, backgroundSize: "cover", backgroundPosition: "center" }}>
          <SystemTray onShowDesktops={() => setScreenState("welcome")} onLock={handleLock} onManageDesktops={() => setShowDesktopManager(true)} desktops={settings.desktops} currentDesktopId={settings.currentDesktopId} onSelectDesktop={handleSelectDesktop} />

          <div className={cn("flex-1 flex overflow-hidden", dockAtBottom ? "flex-col" : "flex-row")}>
            {!dockAtBottom && <Dock apps={defaultApps} windows={windows} pinnedAppIds={pinnedAppIds} onAppClick={openWindow} onWindowClick={handleWindowClick} onShowAllApps={() => setScreenState("welcome")} isMobile={false} />}

            <div className="flex-1 relative" onContextMenu={handleContextMenu} onClick={closeContextMenu}>
              {!isMobile && (
                <div className="absolute inset-0 p-4 grid grid-cols-[repeat(auto-fill,80px)] grid-rows-[repeat(auto-fill,90px)] gap-2 content-start">
                  {defaultApps.slice(0, 6).map((app) => <DesktopIcon key={app.id} icon={app.icon} label={app.title} onDoubleClick={() => openWindow(app)} />)}
                </div>
              )}

              {windows.map((w) => (
                <Window key={w.id} window={w} onClose={() => closeWindow(w.id)} onMinimize={() => minimizeWindow(w.id)} onMaximize={() => maximizeWindow(w.id)} onFocus={() => focusWindow(w.id)} onPositionChange={(pos) => updateWindowPosition(w.id, pos)} onSizeChange={(size) => updateWindowSize(w.id, size)} isMobile={isMobile} />
              ))}

              {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={closeContextMenu} onRefresh={() => window.location.reload()} />}
            </div>

            {dockAtBottom && <Dock apps={defaultApps} windows={windows} pinnedAppIds={pinnedAppIds} onAppClick={openWindow} onWindowClick={handleWindowClick} onShowAllApps={() => setScreenState("welcome")} isMobile={true} />}
          </div>
        </div>
      )}

      {showDesktopManager && <DesktopManager desktops={settings.desktops} currentDesktopId={settings.currentDesktopId} onSelectDesktop={handleSelectDesktop} onDesktopsChange={handleDesktopsChange} onClose={() => setShowDesktopManager(false)} />}
    </div>
  )
}
