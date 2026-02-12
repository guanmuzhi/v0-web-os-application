"use client"
import { cn } from "@/lib/utils"
import type { AppDefinition, WindowState } from "@/lib/webos-store"
import { Plus } from "lucide-react"

interface DockProps {
  apps: AppDefinition[]
  windows: WindowState[]
  pinnedAppIds: string[]
  onAppClick: (app: AppDefinition) => void
  onWindowClick: (windowId: string) => void
  onShowAllApps: () => void
  className?: string
  isMobile?: boolean
}

export function Dock({
  apps,
  windows,
  pinnedAppIds,
  onAppClick,
  onWindowClick,
  onShowAllApps,
  className,
  isMobile,
}: DockProps) {
  const pinnedApps = apps.filter((app) => pinnedAppIds.includes(app.id))
  const runningApps = windows.filter((w) => !pinnedAppIds.includes(w.appId))

  return (
    <div
      className={cn(
        "flex bg-black/40 backdrop-blur-xl border-r border-white/10",
        isMobile ? "flex-row h-16 w-full border-r-0 border-t justify-center" : "flex-col w-16 h-full py-4",
        className,
      )}
    >
      {/* Pinned Apps */}
      <div className={cn("flex gap-2", isMobile ? "flex-row px-4" : "flex-col items-center px-2")}>
        {pinnedApps.map((app) => {
          const isRunning = windows.some((w) => w.appId === app.id)
          const windowState = windows.find((w) => w.appId === app.id)
          const isMinimized = windowState?.isMinimized

          return (
            <button
              key={app.id}
              onClick={() => {
                if (windowState) {
                  onWindowClick(windowState.id)
                } else {
                  onAppClick(app)
                }
              }}
              className={cn(
                "relative w-11 h-11 flex items-center justify-center rounded-xl transition-all",
                "hover:bg-white/20 active:scale-90",
                isRunning && "bg-white/10",
              )}
              title={app.title}
            >
              <div className={cn("text-white", isMinimized && "opacity-50")}>{app.icon}</div>
              {isRunning && (
                <div
                  className={cn(
                    "absolute rounded-full bg-white",
                    isMobile ? "bottom-0 left-1/2 -translate-x-1/2 w-1 h-1" : "left-0 top-1/2 -translate-y-1/2 w-1 h-4",
                  )}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Separator */}
      {(runningApps.length > 0 || !isMobile) && (
        <div className={cn("bg-white/20", isMobile ? "w-px h-8 mx-2" : "h-px w-8 my-2 mx-auto")} />
      )}

      {/* Running Apps (not pinned) */}
      <div className={cn("flex gap-2", isMobile ? "flex-row" : "flex-col items-center flex-1 overflow-auto px-2")}>
        {runningApps.map((win) => (
          <button
            key={win.id}
            onClick={() => onWindowClick(win.id)}
            className={cn(
              "relative w-11 h-11 flex items-center justify-center rounded-xl transition-all",
              "bg-white/10 hover:bg-white/20 active:scale-90",
            )}
            title={win.title}
          >
            <div className={cn("text-white", win.isMinimized && "opacity-50")}>{win.icon}</div>
            <div
              className={cn(
                "absolute rounded-full bg-primary",
                isMobile ? "bottom-0 left-1/2 -translate-x-1/2 w-1 h-1" : "left-0 top-1/2 -translate-y-1/2 w-1 h-4",
              )}
            />
          </button>
        ))}
      </div>

      {/* Show All Apps Button */}
      {!isMobile && (
        <div className="px-2 mt-auto">
          <button
            onClick={onShowAllApps}
            className={cn(
              "w-11 h-11 flex items-center justify-center rounded-xl transition-all",
              "bg-white/10 hover:bg-white/20 active:scale-90",
            )}
            title="所有应用"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      )}
    </div>
  )
}
