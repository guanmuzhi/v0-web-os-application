"use client"

import type React from "react"
import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import {
  Wifi, Bluetooth, Monitor, Volume2, Bell, Shield, Palette, Globe, Info, ImageIcon,
  Upload, Check, WifiOff, BluetoothOff, BellOff, Moon, Sun, ChevronRight,
  Eye, MapPin, BarChart3, Clock, Calendar, HardDrive, Trash2, RotateCw,
} from "lucide-react"
import {
  settingsGet, settingsSave, settingsReset,
  wallpaperListAll, wallpaperListDefaults, wallpaperSet, wallpaperUpload, wallpaperRemoveCustom,
  fileStorageUsed, fileFormatSize,
  type WebOSSettings,
} from "@/lib/webos-api"

const settingCategories = [
  { id: "wallpaper", icon: <ImageIcon className="w-5 h-5" />, label: "壁纸" },
  { id: "display", icon: <Monitor className="w-5 h-5" />, label: "显示" },
  { id: "sound", icon: <Volume2 className="w-5 h-5" />, label: "声音" },
  { id: "wifi", icon: <Wifi className="w-5 h-5" />, label: "网络" },
  { id: "bluetooth", icon: <Bluetooth className="w-5 h-5" />, label: "蓝牙" },
  { id: "notifications", icon: <Bell className="w-5 h-5" />, label: "通知" },
  { id: "privacy", icon: <Shield className="w-5 h-5" />, label: "隐私" },
  { id: "appearance", icon: <Palette className="w-5 h-5" />, label: "外观" },
  { id: "language", icon: <Globe className="w-5 h-5" />, label: "语言与时间" },
  { id: "storage", icon: <HardDrive className="w-5 h-5" />, label: "存储" },
  { id: "about", icon: <Info className="w-5 h-5" />, label: "关于" },
]

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className={cn("relative w-12 h-6 rounded-full transition-colors", enabled ? "bg-primary" : "bg-white/20")}>
      <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-transform", enabled ? "right-1" : "left-1")} />
    </button>
  )
}

function Slider({ value, onChange, min = 0, max = 100 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary" />
}

function SettingRow({ icon, title, description, children }: { icon?: React.ReactNode; title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/10">
      <div className="flex items-center gap-3">
        {icon && <div className="text-white/60">{icon}</div>}
        <div><p className="text-sm text-white">{title}</p>{description && <p className="text-xs text-white/50">{description}</p>}</div>
      </div>
      {children}
    </div>
  )
}

export function SettingsApp() {
  const [selectedCategory, setSelectedCategory] = useState("wallpaper")
  const [settings, setSettings] = useState<WebOSSettings>(settingsGet)
  const [storageUsedBytes, setStorageUsedBytes] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allWallpapers = wallpaperListAll()
  const defaultWallpapers = wallpaperListDefaults()

  const updateSetting = <K extends keyof WebOSSettings>(key: K, value: WebOSSettings[K]) => {
    const updated = settingsSave({ [key]: value })
    setSettings(updated)
  }

  const handleWallpaperSelect = (wp: string) => { wallpaperSet(wp); setSettings(settingsGet()) }

  const handleUploadWallpaper = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await wallpaperUpload(file)
    setSettings(settingsGet())
  }

  const handleRemoveCustomWallpaper = (url: string) => {
    wallpaperRemoveCustom(url)
    setSettings(settingsGet())
  }

  const loadStorageInfo = async () => {
    const used = await fileStorageUsed()
    setStorageUsedBytes(used)
  }

  const handleResetSettings = () => {
    if (!confirm("确定要重置所有设置吗？")) return
    settingsReset()
    setSettings(settingsGet())
  }

  return (
    <div className="h-full flex bg-[oklch(0.12_0.01_250)]">
      {/* Sidebar */}
      <div className="w-56 bg-black/20 border-r border-white/10 p-3 space-y-1 overflow-auto">
        {settingCategories.map((category) => (
          <button key={category.id} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors", selectedCategory === category.id ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white")} onClick={() => { setSelectedCategory(category.id); if (category.id === "storage") loadStorageInfo() }}>
            {category.icon}
            <span className="text-sm">{category.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Wallpaper */}
        {selectedCategory === "wallpaper" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">壁纸设置</h2>
            <div className="relative aspect-video max-w-md rounded-xl overflow-hidden border border-white/20">
              <img src={settings.wallpaper || "/placeholder.svg"} alt="当前壁纸" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <span className="px-3 py-1 bg-black/50 rounded-full text-white text-sm">当前壁纸</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white/80">选择壁纸</h3>
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors">
                  <Upload className="w-4 h-4" />上传图片
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadWallpaper} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {allWallpapers.map((wp, i) => (
                  <div key={i} className="relative group">
                    <button onClick={() => handleWallpaperSelect(wp)} className={cn("relative w-full aspect-video rounded-lg overflow-hidden border-2 transition-all", settings.wallpaper === wp ? "border-primary ring-2 ring-primary/50" : "border-white/10 hover:border-white/30")}>
                      <img src={wp || "/placeholder.svg"} alt={`壁纸 ${i + 1}`} className="w-full h-full object-cover" />
                      {settings.wallpaper === wp && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                    {!defaultWallpapers.includes(wp) && (
                      <button onClick={() => handleRemoveCustomWallpaper(wp)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full items-center justify-center hidden group-hover:flex">
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Display */}
        {selectedCategory === "display" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">显示设置</h2>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between"><label className="text-sm text-white">亮度</label><span className="text-sm text-white/60">{settings.brightness}%</span></div>
                <Slider value={settings.brightness} onChange={(v) => updateSetting("brightness", v)} />
              </div>
              <SettingRow icon={<Moon className="w-4 h-4" />} title="夜间模式" description="降低蓝光以保护眼睛"><Toggle enabled={settings.nightMode} onChange={() => updateSetting("nightMode", !settings.nightMode)} /></SettingRow>
              <SettingRow title="动画效果" description="启用窗口动画和过渡效果"><Toggle enabled={settings.animations} onChange={() => updateSetting("animations", !settings.animations)} /></SettingRow>
              <SettingRow title="像素风格" description="启用 Minecraft 风格像素效果"><Toggle enabled={settings.pixelEffect} onChange={() => updateSetting("pixelEffect", !settings.pixelEffect)} /></SettingRow>
            </div>
          </div>
        )}

        {/* Sound */}
        {selectedCategory === "sound" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">声音设置</h2>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Volume2 className="w-4 h-4 text-white/60" /><label className="text-sm text-white">系统音量</label></div><span className="text-sm text-white/60">{settings.volume}%</span></div>
                <Slider value={settings.volume} onChange={(v) => updateSetting("volume", v)} />
              </div>
              <SettingRow title="静音" description="关闭所有声音"><Toggle enabled={settings.muted} onChange={() => updateSetting("muted", !settings.muted)} /></SettingRow>
              <SettingRow title="通知声音" description="收到通知时播放声音"><Toggle enabled={settings.notificationSound} onChange={() => updateSetting("notificationSound", !settings.notificationSound)} /></SettingRow>
              <SettingRow title="系统声音" description="系统操作的声音"><Toggle enabled={settings.systemSound} onChange={() => updateSetting("systemSound", !settings.systemSound)} /></SettingRow>
            </div>
          </div>
        )}

        {/* WiFi */}
        {selectedCategory === "wifi" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">网络设置</h2>
            <div className="space-y-4">
              <SettingRow icon={settings.wifiEnabled ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />} title="WiFi" description={settings.wifiEnabled ? `已连接到 ${settings.wifiNetwork}` : "已关闭"}><Toggle enabled={settings.wifiEnabled} onChange={() => updateSetting("wifiEnabled", !settings.wifiEnabled)} /></SettingRow>
              {settings.wifiEnabled && (
                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-medium text-white/80 mb-3">可用网络</h3>
                  {["WebOS-Network", "Guest-WiFi", "Office-5G", "Home-Network"].map((network) => (
                    <button key={network} onClick={() => updateSetting("wifiNetwork", network)} className={cn("w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors", settings.wifiNetwork === network ? "bg-primary/20 text-white" : "hover:bg-white/5 text-white/80")}>
                      <div className="flex items-center gap-3"><Wifi className="w-4 h-4" /><span className="text-sm">{network}</span></div>
                      {settings.wifiNetwork === network && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bluetooth */}
        {selectedCategory === "bluetooth" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">蓝牙设置</h2>
            <div className="space-y-4">
              <SettingRow icon={settings.bluetoothEnabled ? <Bluetooth className="w-4 h-4" /> : <BluetoothOff className="w-4 h-4" />} title="蓝牙" description={settings.bluetoothEnabled ? "开启并可被发现" : "已关闭"}><Toggle enabled={settings.bluetoothEnabled} onChange={() => updateSetting("bluetoothEnabled", !settings.bluetoothEnabled)} /></SettingRow>
              {settings.bluetoothEnabled && (
                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-medium text-white/80 mb-3">已配对设备</h3>
                  {["AirPods Pro", "Magic Keyboard", "Magic Mouse"].map((device) => (
                    <div key={device} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5">
                      <div className="flex items-center gap-3"><Bluetooth className="w-4 h-4 text-white/60" /><span className="text-sm text-white">{device}</span></div>
                      <span className="text-xs text-green-400">已连接</span>
                    </div>
                  ))}
                  <h3 className="text-sm font-medium text-white/80 mt-4 mb-3">可用设备</h3>
                  <p className="text-sm text-white/40 text-center py-4">正在搜索设备...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notifications */}
        {selectedCategory === "notifications" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">通知设置</h2>
            <div className="space-y-4">
              <SettingRow icon={<Bell className="w-4 h-4" />} title="通知" description="允许应用发送通知"><Toggle enabled={settings.notificationsEnabled} onChange={() => updateSetting("notificationsEnabled", !settings.notificationsEnabled)} /></SettingRow>
              <SettingRow icon={<BellOff className="w-4 h-4" />} title="勿扰模式" description="暂时静音所有通知"><Toggle enabled={settings.doNotDisturb} onChange={() => updateSetting("doNotDisturb", !settings.doNotDisturb)} /></SettingRow>
              <SettingRow icon={<Eye className="w-4 h-4" />} title="显示预览" description="在通知中显示内容预览"><Toggle enabled={settings.showPreviews} onChange={() => updateSetting("showPreviews", !settings.showPreviews)} /></SettingRow>
            </div>
          </div>
        )}

        {/* Privacy */}
        {selectedCategory === "privacy" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">隐私设置</h2>
            <div className="space-y-4">
              <SettingRow icon={<MapPin className="w-4 h-4" />} title="位置服务" description="允许应用访问您的位置"><Toggle enabled={settings.locationEnabled} onChange={() => updateSetting("locationEnabled", !settings.locationEnabled)} /></SettingRow>
              <SettingRow icon={<BarChart3 className="w-4 h-4" />} title="分析数据" description="帮助改进 WebOS"><Toggle enabled={settings.analyticsEnabled} onChange={() => updateSetting("analyticsEnabled", !settings.analyticsEnabled)} /></SettingRow>
              <div className="bg-white/5 rounded-xl p-4 mt-4">
                <h3 className="text-sm font-medium text-white/80 mb-3">应用权限</h3>
                {["浏览器", "文件管理器", "音乐播放器", "图库"].map((app) => (
                  <div key={app} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-sm text-white">{app}</span><ChevronRight className="w-4 h-4 text-white/40" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Appearance */}
        {selectedCategory === "appearance" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">外观设置</h2>
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="text-sm text-white">主题</label>
                <div className="flex gap-3">
                  {[{ id: "dark", label: "深色", icon: <Moon className="w-4 h-4" /> }, { id: "light", label: "浅色", icon: <Sun className="w-4 h-4" /> }, { id: "auto", label: "自动", icon: <Monitor className="w-4 h-4" /> }].map((theme) => (
                    <button key={theme.id} onClick={() => updateSetting("theme", theme.id as "dark" | "light" | "auto")} className={cn("flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all", settings.theme === theme.id ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/20")}>
                      <div className="text-white">{theme.icon}</div><span className="text-sm text-white">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm text-white">强调色</label>
                <div className="flex gap-2">
                  {["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"].map((color) => (
                    <button key={color} onClick={() => updateSetting("accentColor", color)} className={cn("w-10 h-10 rounded-full transition-all", settings.accentColor === color && "ring-2 ring-white ring-offset-2 ring-offset-[oklch(0.12_0.01_250)]")} style={{ backgroundColor: color }}>
                      {settings.accentColor === color && <Check className="w-5 h-5 text-white mx-auto" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm text-white">字体大小</label>
                <div className="flex gap-3">
                  {[{ id: "small", label: "小" }, { id: "medium", label: "中" }, { id: "large", label: "大" }].map((size) => (
                    <button key={size.id} onClick={() => updateSetting("fontSize", size.id as "small" | "medium" | "large")} className={cn("flex-1 py-2 px-4 rounded-lg border transition-all", settings.fontSize === size.id ? "border-primary bg-primary/10 text-white" : "border-white/10 text-white/60 hover:border-white/20")}>{size.label}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm text-white">Dock 位置</label>
                <div className="flex gap-3">
                  {[{ id: "left", label: "左侧" }, { id: "bottom", label: "底部" }].map((pos) => (
                    <button key={pos.id} onClick={() => updateSetting("dockPosition", pos.id as "left" | "bottom")} className={cn("flex-1 py-2 px-4 rounded-lg border transition-all", settings.dockPosition === pos.id ? "border-primary bg-primary/10 text-white" : "border-white/10 text-white/60 hover:border-white/20")}>{pos.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Language */}
        {selectedCategory === "language" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">语言与时间</h2>
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="text-sm text-white flex items-center gap-2"><Globe className="w-4 h-4 text-white/60" />语言</label>
                <select value={settings.language} onChange={(e) => updateSetting("language", e.target.value as "zh" | "en")} className="w-full bg-white/10 rounded-lg px-4 py-3 text-white outline-none border border-white/10 focus:border-white/20">
                  <option value="zh">简体中文</option><option value="en">English</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-sm text-white flex items-center gap-2"><Clock className="w-4 h-4 text-white/60" />时间格式</label>
                <div className="flex gap-3">
                  {[{ id: "24h", label: "24 小时制" }, { id: "12h", label: "12 小时制" }].map((format) => (
                    <button key={format.id} onClick={() => updateSetting("timeFormat", format.id as "12h" | "24h")} className={cn("flex-1 py-2 px-4 rounded-lg border transition-all", settings.timeFormat === format.id ? "border-primary bg-primary/10 text-white" : "border-white/10 text-white/60 hover:border-white/20")}>{format.label}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm text-white flex items-center gap-2"><Calendar className="w-4 h-4 text-white/60" />日期格式</label>
                <select value={settings.dateFormat} onChange={(e) => updateSetting("dateFormat", e.target.value as "yyyy-mm-dd" | "mm-dd-yyyy" | "dd-mm-yyyy")} className="w-full bg-white/10 rounded-lg px-4 py-3 text-white outline-none border border-white/10 focus:border-white/20">
                  <option value="yyyy-mm-dd">2025-01-18</option><option value="mm-dd-yyyy">01-18-2025</option><option value="dd-mm-yyyy">18-01-2025</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Storage */}
        {selectedCategory === "storage" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">存储管理</h2>
            <div className="bg-white/5 rounded-xl p-6 space-y-4 border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center"><HardDrive className="w-7 h-7 text-primary" /></div>
                <div>
                  <h3 className="text-lg font-semibold text-white">虚拟磁盘</h3>
                  <p className="text-sm text-white/60">已用: {fileFormatSize(storageUsedBytes)}</p>
                </div>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min((storageUsedBytes / (5 * 1024 * 1024)) * 100, 100)}%` }} />
              </div>
              <p className="text-xs text-white/40">存储在浏览器 IndexedDB 中，最大建议 5 MB</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-sm font-medium text-white/80 mb-3">清理</h3>
              <button onClick={handleResetSettings} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm transition-colors">
                <RotateCw className="w-4 h-4" />重置所有设置
              </button>
            </div>
          </div>
        )}

        {/* About */}
        {selectedCategory === "about" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">关于 WebOS</h2>
            <div className="bg-white/5 rounded-xl p-6 space-y-4 border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center"><Monitor className="w-8 h-8 text-primary" /></div>
                <div><h3 className="text-lg font-semibold text-white">WebOS</h3><p className="text-sm text-white/60">版本 2.1.0</p></div>
              </div>
              <div className="space-y-2 pt-4 border-t border-white/10">
                {[["运行环境", "Web Browser"], ["存储", "IndexedDB + LocalStorage"], ["API", "webos-api.ts 集中式模块"], ["特性", "虚拟文件系统、HTML应用支持"], ["多用户", "支持"], ["多桌面", "支持"]].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm"><span className="text-white/60">{k}</span><span className="text-white">{v}</span></div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
