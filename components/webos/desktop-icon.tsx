"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface DesktopIconProps {
  icon: React.ReactNode
  label: string
  onDoubleClick: () => void
}

export function DesktopIcon({ icon, label, onDoubleClick }: DesktopIconProps) {
  const [isSelected, setIsSelected] = useState(false)

  return (
    <button
      className={cn(
        "w-20 h-24 flex flex-col items-center justify-center gap-1 rounded-lg transition-all",
        isSelected ? "bg-primary/20" : "hover:bg-white/10",
      )}
      onClick={() => setIsSelected(true)}
      onBlur={() => setIsSelected(false)}
      onDoubleClick={onDoubleClick}
    >
      <div className={cn("text-foreground transition-transform", isSelected && "scale-110")}>{icon}</div>
      <span
        className={cn(
          "text-xs text-foreground text-center px-1 leading-tight max-w-full truncate",
          isSelected && "bg-primary/50 rounded px-1",
        )}
      >
        {label}
      </span>
    </button>
  )
}
