"use client"

import { RefreshCw, FolderPlus, Settings, ImageIcon, Monitor } from "lucide-react"

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onRefresh: () => void
}

export function ContextMenu({ x, y, onClose, onRefresh }: ContextMenuProps) {
  const handleOpenSettings = () => {
    window.dispatchEvent(new CustomEvent("webos-open-app", { detail: { appId: "settings" } }))
    onClose()
  }

  const menuItems = [
    { icon: <RefreshCw className="w-4 h-4" />, label: "刷新桌面", onClick: onRefresh },
    { icon: <FolderPlus className="w-4 h-4" />, label: "新建文件夹", onClick: onClose },
    { divider: true },
    { icon: <ImageIcon className="w-4 h-4" />, label: "更换壁纸", onClick: handleOpenSettings },
    { icon: <Monitor className="w-4 h-4" />, label: "显示设置", onClick: handleOpenSettings },
    { divider: true },
    { icon: <Settings className="w-4 h-4" />, label: "系统设置", onClick: handleOpenSettings },
  ]

  // Adjust position if menu would go off screen
  const adjustedX = Math.min(x, window.innerWidth - 200)
  const adjustedY = Math.min(y, window.innerHeight - 280)

  return (
    <div
      className="absolute bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl py-1.5 min-w-[180px] z-[10000] animate-in fade-in zoom-in-95 duration-100"
      style={{ left: adjustedX, top: adjustedY }}
      onClick={(e) => e.stopPropagation()}
    >
      {menuItems.map((item, index) =>
        item.divider ? (
          <div key={index} className="h-px bg-white/10 my-1.5" />
        ) : (
          <button
            key={index}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors"
            onClick={item.onClick}
          >
            <span className="text-white/60">{item.icon}</span>
            {item.label}
          </button>
        ),
      )}
    </div>
  )
}
