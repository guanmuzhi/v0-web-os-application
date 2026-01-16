"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Wifi, Bluetooth, Monitor, Volume2, Bell, Shield, Palette, User, Globe, Info } from "lucide-react"

const settingCategories = [
  { id: "wifi", icon: <Wifi className="w-5 h-5" />, label: "网络" },
  { id: "bluetooth", icon: <Bluetooth className="w-5 h-5" />, label: "蓝牙" },
  { id: "display", icon: <Monitor className="w-5 h-5" />, label: "显示" },
  { id: "sound", icon: <Volume2 className="w-5 h-5" />, label: "声音" },
  { id: "notifications", icon: <Bell className="w-5 h-5" />, label: "通知" },
  { id: "privacy", icon: <Shield className="w-5 h-5" />, label: "隐私" },
  { id: "appearance", icon: <Palette className="w-5 h-5" />, label: "外观" },
  { id: "accounts", icon: <User className="w-5 h-5" />, label: "账户" },
  { id: "language", icon: <Globe className="w-5 h-5" />, label: "语言" },
  { id: "about", icon: <Info className="w-5 h-5" />, label: "关于" },
]

export function SettingsApp() {
  const [selectedCategory, setSelectedCategory] = useState("display")

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-56 bg-secondary/30 border-r border-border p-3 space-y-1">
        {settingCategories.map((category) => (
          <button
            key={category.id}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
              selectedCategory === category.id
                ? "bg-primary/20 text-foreground"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
            )}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.icon}
            <span className="text-sm">{category.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {selectedCategory === "display" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">显示设置</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-foreground">亮度</label>
                <input
                  type="range"
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  defaultValue={75}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-foreground">夜间模式</label>
                <div className="flex items-center gap-3">
                  <button className="relative w-12 h-6 bg-primary rounded-full">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </button>
                  <span className="text-sm text-muted-foreground">已开启</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-foreground">分辨率</label>
                <select className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground outline-none">
                  <option>1920 x 1080</option>
                  <option>2560 x 1440</option>
                  <option>3840 x 2160</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-foreground">缩放</label>
                <select className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground outline-none">
                  <option>100%</option>
                  <option>125%</option>
                  <option>150%</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {selectedCategory === "about" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">关于 WebOS</h2>

            <div className="bg-secondary/30 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Monitor className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">WebOS</h3>
                  <p className="text-sm text-muted-foreground">版本 1.0.0</p>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">处理器</span>
                  <span className="text-foreground">Web Runtime</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">内存</span>
                  <span className="text-foreground">浏览器管理</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">存储</span>
                  <span className="text-foreground">LocalStorage</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
