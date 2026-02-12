"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import type { AppDefinition } from "@/lib/webos-store"
import { Search, Grid3X3, Clock, Folder, Settings, ChevronRight } from "lucide-react"
import { SystemTray } from "./system-tray"

interface WelcomeScreenProps {
  apps: AppDefinition[]
  onAppOpen: (app: AppDefinition) => void
  onEnterDesktop: () => void
  wallpaper: string
  userName: string
  pixelEffect?: boolean
}

const categories = [
  { id: "all", label: "全部", icon: <Grid3X3 className="w-4 h-4" /> },
  { id: "system", label: "系统", icon: <Settings className="w-4 h-4" /> },
  { id: "productivity", label: "生产力", icon: <Folder className="w-4 h-4" /> },
  { id: "media", label: "媒体", icon: <Clock className="w-4 h-4" /> },
  { id: "utilities", label: "工具", icon: <Settings className="w-4 h-4" /> },
]

export function WelcomeScreen({
  apps,
  onAppOpen,
  onEnterDesktop,
  wallpaper,
  userName,
  pixelEffect,
}: WelcomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || app.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [apps, searchQuery, selectedCategory])

  return (
    <div
      className={cn("fixed inset-0 z-[9000] flex flex-col select-none", pixelEffect && "pixel-effect")}
      style={{
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Background blur overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" />

      {/* System Tray */}
      <SystemTray onShowDesktops={onEnterDesktop} className="relative z-10" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 md:p-8">
          <h1 className={cn("text-2xl md:text-3xl font-semibold text-white mb-2", pixelEffect && "font-mono")}>
            你好，{userName}
          </h1>

          {/* Search Bar */}
          <div className="relative max-w-md mt-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
            <input
              type="text"
              placeholder="搜索应用..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3",
                "text-white placeholder:text-white/50 outline-none",
                "focus:bg-white/15 focus:border-white/30 transition-all",
              )}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="px-6 md:px-8 flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all",
                selectedCategory === cat.id ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20",
              )}
            >
              {cat.icon}
              <span className="text-sm font-medium">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Apps Grid */}
        <div className="flex-1 overflow-auto px-6 md:px-8 pb-6">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
            {filteredApps.map((app) => (
              <button
                key={app.id}
                onClick={() => onAppOpen(app)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl",
                  "hover:bg-white/10 active:scale-95 transition-all",
                )}
              >
                <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white/10 rounded-xl text-white">
                  {app.icon}
                </div>
                <span className="text-xs text-white/90 text-center line-clamp-2">{app.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Enter Desktop Button */}
        <div className="p-6 md:p-8 flex justify-center">
          <button
            onClick={onEnterDesktop}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-full",
              "bg-white/10 hover:bg-white/20 text-white transition-all",
              "border border-white/20",
            )}
          >
            <span>进入桌面</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
