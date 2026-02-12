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
        "w-[76px] h-[86px] flex flex-col items-center justify-center gap-1.5 rounded-lg transition-all",
        isSelected ? "bg-white/20" : "hover:bg-white/10",
      )}
      onClick={() => setIsSelected(true)}
      onBlur={() => setIsSelected(false)}
      onDoubleClick={onDoubleClick}
    >
      <div
        className={cn(
          "w-10 h-10 flex items-center justify-center text-white [&>svg]:w-8 [&>svg]:h-8 transition-transform",
          isSelected && "scale-110",
        )}
      >
        {icon}
      </div>
      <span
        className={cn(
          "text-[11px] text-white text-center px-1 leading-tight max-w-full line-clamp-2",
          isSelected && "bg-white/30 rounded px-1.5",
        )}
      >
        {label}
      </span>
    </button>
  )
}
