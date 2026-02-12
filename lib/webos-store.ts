// Global state management for WebOS using localStorage for persistence
import type React from "react"

export interface UserProfile {
  id: string
  name: string
  avatar: string
  color: string
  createdAt: number
}

export interface DesktopConfig {
  id: string
  name: string
  wallpaper: string
  iconLayout: { appId: string; x: number; y: number }[]
}

export interface WebOSSettings {
  // Display
  wallpaper: string
  wallpaperType: "url" | "color" | "custom"
  customWallpapers: string[]
  brightness: number
  nightMode: boolean
  animations: boolean
  pixelEffect: boolean

  // Sound
  volume: number
  muted: boolean
  notificationSound: boolean
  systemSound: boolean

  // Network
  wifiEnabled: boolean
  wifiNetwork: string
  bluetoothEnabled: boolean
  bluetoothDevices: string[]

  // Notifications
  notificationsEnabled: boolean
  doNotDisturb: boolean
  showPreviews: boolean

  // Privacy
  locationEnabled: boolean
  analyticsEnabled: boolean

  // Appearance
  theme: "dark" | "light" | "auto"
  accentColor: string
  fontSize: "small" | "medium" | "large"
  dockPosition: "left" | "bottom"

  // Language
  language: "zh" | "en"
  timeFormat: "12h" | "24h"
  dateFormat: "yyyy-mm-dd" | "mm-dd-yyyy" | "dd-mm-yyyy"

  // User
  currentUserId: string
  userName: string
  users: UserProfile[]

  // Multi-desktop
  desktops: DesktopConfig[]
  currentDesktopId: string
}

const DEFAULT_WALLPAPERS = [
  "/images/49fab4ed-fc84-4ac0-8f8c-a64b12e4dc5a.png",
  "/images/717d6c43-94a2-4990-a795-c9ad958076d7-minecraft-thegardenawakens-dotnet-2560x1440.png",
  "/images/4374e6df-d55f-400b-8abe-ee00d5f1fb7b-wallpaper-minecraft-burberry-2560x1440.png",
]

const DEFAULT_USER: UserProfile = {
  id: "default",
  name: "用户",
  avatar: "",
  color: "#3b82f6",
  createdAt: Date.now(),
}

const DEFAULT_DESKTOP: DesktopConfig = {
  id: "desktop-1",
  name: "桌面 1",
  wallpaper: DEFAULT_WALLPAPERS[0],
  iconLayout: [],
}

const DEFAULT_SETTINGS: WebOSSettings = {
  // Display
  wallpaper: DEFAULT_WALLPAPERS[0],
  wallpaperType: "url",
  customWallpapers: [],
  brightness: 100,
  nightMode: false,
  animations: true,
  pixelEffect: false,

  // Sound
  volume: 75,
  muted: false,
  notificationSound: true,
  systemSound: true,

  // Network
  wifiEnabled: true,
  wifiNetwork: "WebOS-Network",
  bluetoothEnabled: false,
  bluetoothDevices: [],

  // Notifications
  notificationsEnabled: true,
  doNotDisturb: false,
  showPreviews: true,

  // Privacy
  locationEnabled: false,
  analyticsEnabled: false,

  // Appearance
  theme: "dark",
  accentColor: "#3b82f6",
  fontSize: "medium",
  dockPosition: "left",

  // Language
  language: "zh",
  timeFormat: "24h",
  dateFormat: "yyyy-mm-dd",

  // User
  currentUserId: "default",
  userName: "用户",
  users: [DEFAULT_USER],

  // Multi-desktop
  desktops: [DEFAULT_DESKTOP],
  currentDesktopId: "desktop-1",
}

export function getSettings(): WebOSSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  try {
    const stored = localStorage.getItem("webos-settings")
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
    }
  } catch {}
  return DEFAULT_SETTINGS
}

export function saveSettings(settings: Partial<WebOSSettings>): WebOSSettings {
  const current = getSettings()
  const updated = { ...current, ...settings }
  localStorage.setItem("webos-settings", JSON.stringify(updated))
  return updated
}

export function getDefaultWallpapers(): string[] {
  return DEFAULT_WALLPAPERS
}

// User management
export function createUser(name: string, color: string): UserProfile {
  const user: UserProfile = {
    id: `user-${Date.now()}`,
    name,
    avatar: "",
    color,
    createdAt: Date.now(),
  }
  const settings = getSettings()
  const users = [...settings.users, user]
  saveSettings({ users })
  return user
}

export function deleteUser(userId: string): void {
  const settings = getSettings()
  if (settings.users.length <= 1) return // Keep at least one user
  const users = settings.users.filter((u) => u.id !== userId)
  const currentUserId = settings.currentUserId === userId ? users[0].id : settings.currentUserId
  saveSettings({ users, currentUserId })
}

export function switchUser(userId: string): WebOSSettings {
  const settings = getSettings()
  const user = settings.users.find((u) => u.id === userId)
  if (user) {
    return saveSettings({ currentUserId: userId, userName: user.name })
  }
  return settings
}

// Desktop management
export function createDesktop(name: string, wallpaper?: string): DesktopConfig {
  const settings = getSettings()
  const desktop: DesktopConfig = {
    id: `desktop-${Date.now()}`,
    name,
    wallpaper: wallpaper || settings.wallpaper,
    iconLayout: [],
  }
  const desktops = [...settings.desktops, desktop]
  saveSettings({ desktops })
  return desktop
}

export function deleteDesktop(desktopId: string): void {
  const settings = getSettings()
  if (settings.desktops.length <= 1) return
  const desktops = settings.desktops.filter((d) => d.id !== desktopId)
  const currentDesktopId = settings.currentDesktopId === desktopId ? desktops[0].id : settings.currentDesktopId
  saveSettings({ desktops, currentDesktopId })
}

export function switchDesktop(desktopId: string): WebOSSettings {
  const settings = getSettings()
  const desktop = settings.desktops.find((d) => d.id === desktopId)
  if (desktop) {
    return saveSettings({ currentDesktopId: desktopId, wallpaper: desktop.wallpaper })
  }
  return settings
}

export interface AppDefinition {
  id: string
  title: string
  icon: React.ReactNode
  component: string
  category: "system" | "productivity" | "media" | "games" | "utilities"
}

export interface WindowState {
  id: string
  appId: string
  title: string
  icon: React.ReactNode
  component: string
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  position: { x: number; y: number }
  size: { width: number; height: number }
  props?: Record<string, unknown>
}
