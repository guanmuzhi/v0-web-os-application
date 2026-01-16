"use client"

import { RefreshCw, Monitor, FolderPlus, Settings } from "lucide-react"

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onRefresh: () => void
}

export function ContextMenu({ x, y, onClose, onRefresh }: ContextMenuProps) {
  const menuItems = [
    { icon: <RefreshCw className="w-4 h-4" />, label: "刷新", onClick: onRefresh },
    { icon: <FolderPlus className="w-4 h-4" />, label: "新建文件夹", onClick: onClose },
    { icon: <Monitor className="w-4 h-4" />, label: "显示设置", onClick: onClose },
    { icon: <Settings className="w-4 h-4" />, label: "个性化", onClick: onClose },
  ]

  return (
    <div
      className="absolute bg-[oklch(0.18_0.01_250/0.95)] backdrop-blur-xl rounded-lg border border-border shadow-xl py-1 min-w-[180px] z-[10000]"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      {menuItems.map((item, index) => (
        <button
          key={index}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-secondary/50 transition-colors"
          onClick={item.onClick}
        >
          <span className="text-muted-foreground">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  )
}
