/**
 * WebOS API - Centralized Module Library
 *
 * All system-level functions are exported from this single file.
 * Categories:
 *  - File System (file*)       : CRUD, search, move, copy, read, write on virtual files
 *  - Settings    (settings*)   : read / write / reset global settings
 *  - Wallpaper   (wallpaper*)  : list, set, upload, remove wallpapers
 *  - Users       (user*)       : create, delete, switch, get users
 *  - Desktops    (desktop*)    : create, delete, switch, rename, get desktops
 *  - Apps        (app*)        : open apps & html runner via event bus
 *  - Clipboard   (clipboard*)  : copy text to system clipboard
 *  - System      (system*)     : lock, mobile detect, event helpers
 *  - Types                     : all shared TypeScript interfaces
 */

import type React from "react"

// ─── Types ──────────────────────────────────────────────────────────────────

export interface VirtualFile {
  id: string
  name: string
  type: "file" | "folder"
  parentId: string
  content?: string
  mimeType?: string
  size: number
  createdAt: number
  modifiedAt: number
}

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
  wallpaper: string
  wallpaperType: "url" | "color" | "custom"
  customWallpapers: string[]
  brightness: number
  nightMode: boolean
  animations: boolean
  pixelEffect: boolean
  volume: number
  muted: boolean
  notificationSound: boolean
  systemSound: boolean
  wifiEnabled: boolean
  wifiNetwork: string
  bluetoothEnabled: boolean
  bluetoothDevices: string[]
  notificationsEnabled: boolean
  doNotDisturb: boolean
  showPreviews: boolean
  locationEnabled: boolean
  analyticsEnabled: boolean
  theme: "dark" | "light" | "auto"
  accentColor: string
  fontSize: "small" | "medium" | "large"
  dockPosition: "left" | "bottom"
  language: "zh" | "en"
  timeFormat: "12h" | "24h"
  dateFormat: "yyyy-mm-dd" | "mm-dd-yyyy" | "dd-mm-yyyy"
  currentUserId: string
  userName: string
  users: UserProfile[]
  desktops: DesktopConfig[]
  currentDesktopId: string
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

// ─── Constants ──────────────────────────────────────────────────────────────

const DB_NAME = "webos-fs"
const DB_VERSION = 1
const STORE_NAME = "files"
const SETTINGS_KEY = "webos-settings"

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
  wallpaper: DEFAULT_WALLPAPERS[0],
  wallpaperType: "url",
  customWallpapers: [],
  brightness: 100,
  nightMode: false,
  animations: true,
  pixelEffect: false,
  volume: 75,
  muted: false,
  notificationSound: true,
  systemSound: true,
  wifiEnabled: true,
  wifiNetwork: "WebOS-Network",
  bluetoothEnabled: false,
  bluetoothDevices: [],
  notificationsEnabled: true,
  doNotDisturb: false,
  showPreviews: true,
  locationEnabled: false,
  analyticsEnabled: false,
  theme: "dark",
  accentColor: "#3b82f6",
  fontSize: "medium",
  dockPosition: "left",
  language: "zh",
  timeFormat: "24h",
  dateFormat: "yyyy-mm-dd",
  currentUserId: "default",
  userName: "用户",
  users: [DEFAULT_USER],
  desktops: [DEFAULT_DESKTOP],
  currentDesktopId: "desktop-1",
}

// ─── IndexedDB helper ───────────────────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function dbGetAll(): Promise<VirtualFile[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const store = tx.objectStore(STORE_NAME)
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function dbGet(id: string): Promise<VirtualFile | undefined> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const store = tx.objectStore(STORE_NAME)
    const req = store.get(id)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function dbPut(file: VirtualFile): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)
    store.put(file)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function dbDelete(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)
    store.delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// ─── File System Initialization ─────────────────────────────────────────────

let fsInitialized = false

async function ensureDefaultFolders() {
  if (fsInitialized) return
  fsInitialized = true
  const all = await dbGetAll()
  const ids = new Set(all.map((f) => f.id))
  const defaultFolders: VirtualFile[] = [
    { id: "home", name: "主目录", type: "folder", parentId: "root", size: 0, createdAt: Date.now(), modifiedAt: Date.now() },
    { id: "documents", name: "文档", type: "folder", parentId: "home", size: 0, createdAt: Date.now(), modifiedAt: Date.now() },
    { id: "downloads", name: "下载", type: "folder", parentId: "home", size: 0, createdAt: Date.now(), modifiedAt: Date.now() },
    { id: "pictures", name: "图片", type: "folder", parentId: "home", size: 0, createdAt: Date.now(), modifiedAt: Date.now() },
    { id: "music", name: "音乐", type: "folder", parentId: "home", size: 0, createdAt: Date.now(), modifiedAt: Date.now() },
    { id: "videos", name: "视频", type: "folder", parentId: "home", size: 0, createdAt: Date.now(), modifiedAt: Date.now() },
    { id: "apps", name: "应用", type: "folder", parentId: "home", size: 0, createdAt: Date.now(), modifiedAt: Date.now() },
  ]
  for (const folder of defaultFolders) {
    if (!ids.has(folder.id)) await dbPut(folder)
  }
  // Seed a sample HTML app
  if (!ids.has("sample-app-clock")) {
    await dbPut({
      id: "sample-app-clock",
      name: "时钟.html",
      type: "file",
      parentId: "apps",
      mimeType: "text/html",
      content: `<!DOCTYPE html><html><head><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#1a1a2e;font-family:monospace}.t{font-size:5rem;color:#00ff88;text-shadow:0 0 20px rgba(0,255,136,.5)}</style></head><body><div class="t" id="t"></div><script>setInterval(()=>{document.getElementById('t').textContent=new Date().toLocaleTimeString('zh-CN',{hour12:false})},1000)</script></body></html>`,
      size: 400,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    })
  }
  if (!ids.has("sample-readme")) {
    await dbPut({
      id: "sample-readme",
      name: "欢迎.txt",
      type: "file",
      parentId: "documents",
      mimeType: "text/plain",
      content: "欢迎使用 WebOS!\n\n这是一个运行在浏览器中的桌面操作系统。\n\n你可以:\n- 使用文件管理器浏览文件\n- 在终端中运行命令\n- 在 HTML 运行器中编写和运行程序\n- 使用设置自定义你的桌面\n\n所有文件存储在浏览器的 IndexedDB 中。",
      size: 200,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    })
  }
}

// ─── File System API ────────────────────────────────────────────────────────

/** List files in a directory */
export async function fileList(parentId: string): Promise<VirtualFile[]> {
  await ensureDefaultFolders()
  const all = await dbGetAll()
  return all.filter((f) => f.parentId === parentId).sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

/** Get a single file by ID */
export async function fileGet(id: string): Promise<VirtualFile | undefined> {
  await ensureDefaultFolders()
  return dbGet(id)
}

/** Read file content as string */
export async function fileRead(id: string): Promise<string> {
  const file = await fileGet(id)
  return file?.content ?? ""
}

/** Write content to an existing file */
export async function fileWrite(id: string, content: string): Promise<void> {
  const file = await dbGet(id)
  if (!file) return
  file.content = content
  file.size = new Blob([content]).size
  file.modifiedAt = Date.now()
  await dbPut(file)
}

/** Create a new file or folder */
export async function fileCreate(opts: {
  name: string
  type: "file" | "folder"
  parentId: string
  content?: string
  mimeType?: string
  size: number
}): Promise<VirtualFile> {
  await ensureDefaultFolders()
  const file: VirtualFile = {
    id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: opts.name,
    type: opts.type,
    parentId: opts.parentId,
    content: opts.content,
    mimeType: opts.mimeType,
    size: opts.size,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  }
  await dbPut(file)
  return file
}

/** Delete a file or folder (and its children) */
export async function fileDelete(id: string): Promise<void> {
  const all = await dbGetAll()
  const toDelete = new Set<string>([id])
  // Recursively find children
  let changed = true
  while (changed) {
    changed = false
    for (const f of all) {
      if (toDelete.has(f.parentId) && !toDelete.has(f.id)) {
        toDelete.add(f.id)
        changed = true
      }
    }
  }
  for (const delId of toDelete) {
    await dbDelete(delId)
  }
}

/** Rename a file or folder */
export async function fileRename(id: string, newName: string): Promise<void> {
  const file = await dbGet(id)
  if (!file) return
  file.name = newName
  file.modifiedAt = Date.now()
  await dbPut(file)
}

/** Move a file to a different parent folder */
export async function fileMove(id: string, newParentId: string): Promise<void> {
  const file = await dbGet(id)
  if (!file) return
  file.parentId = newParentId
  file.modifiedAt = Date.now()
  await dbPut(file)
}

/** Copy a file to a target folder */
export async function fileCopy(id: string, targetParentId: string): Promise<VirtualFile> {
  const original = await dbGet(id)
  if (!original) throw new Error("File not found")
  const copy: VirtualFile = {
    ...original,
    id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: `${original.name} (副本)`,
    parentId: targetParentId,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  }
  await dbPut(copy)
  return copy
}

/** Search files by name */
export async function fileSearch(query: string): Promise<VirtualFile[]> {
  await ensureDefaultFolders()
  const all = await dbGetAll()
  const lowerQuery = query.toLowerCase()
  return all.filter((f) => f.name.toLowerCase().includes(lowerQuery))
}

/** Calculate total storage used (bytes) */
export async function fileStorageUsed(): Promise<number> {
  const all = await dbGetAll()
  return all.reduce((sum, f) => sum + (f.size || 0) + (f.content?.length || 0), 0)
}

/** Format byte size to human-readable string */
export function fileFormatSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`
}

// ─── Settings API ───────────────────────────────────────────────────────────

/** Read current settings */
export function settingsGet(): WebOSSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS
}

/** Save partial settings, returns the full merged result */
export function settingsSave(partial: Partial<WebOSSettings>): WebOSSettings {
  const current = settingsGet()
  const updated = { ...current, ...partial }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
  // Broadcast change event
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("webos-settings-change", { detail: updated }))
  }
  return updated
}

/** Reset settings to defaults */
export function settingsReset(): void {
  localStorage.removeItem(SETTINGS_KEY)
}

// ─── Wallpaper API ──────────────────────────────────────────────────────────

/** Get default (built-in) wallpapers */
export function wallpaperListDefaults(): string[] {
  return [...DEFAULT_WALLPAPERS]
}

/** Get all wallpapers (defaults + custom uploads) */
export function wallpaperListAll(): string[] {
  const s = settingsGet()
  return [...DEFAULT_WALLPAPERS, ...(s.customWallpapers || [])]
}

/** Set the current wallpaper and sync to current desktop */
export function wallpaperSet(url: string): void {
  const s = settingsGet()
  const desktops = s.desktops.map((d) =>
    d.id === s.currentDesktopId ? { ...d, wallpaper: url } : d
  )
  settingsSave({ wallpaper: url, desktops })
}

/** Upload a wallpaper from a File object (converts to data-url) */
export async function wallpaperUpload(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const s = settingsGet()
      const customs = [...(s.customWallpapers || []), dataUrl]
      settingsSave({ customWallpapers: customs, wallpaper: dataUrl })
      resolve(dataUrl)
    }
    reader.readAsDataURL(file)
  })
}

/** Remove a custom wallpaper */
export function wallpaperRemoveCustom(url: string): void {
  const s = settingsGet()
  const customs = (s.customWallpapers || []).filter((w) => w !== url)
  const newWallpaper = s.wallpaper === url ? DEFAULT_WALLPAPERS[0] : s.wallpaper
  settingsSave({ customWallpapers: customs, wallpaper: newWallpaper })
}

// ─── User API ───────────────────────────────────────────────────────────────

/** Create a new user, returns the profile */
export function userCreate(name: string, color: string): UserProfile {
  const user: UserProfile = {
    id: `user-${Date.now()}`,
    name,
    avatar: "",
    color,
    createdAt: Date.now(),
  }
  const s = settingsGet()
  settingsSave({ users: [...s.users, user] })
  return user
}

/** Delete a user (must keep at least one) */
export function userDelete(userId: string): void {
  const s = settingsGet()
  if (s.users.length <= 1) return
  const users = s.users.filter((u) => u.id !== userId)
  const currentUserId = s.currentUserId === userId ? users[0].id : s.currentUserId
  const userName = s.currentUserId === userId ? users[0].name : s.userName
  settingsSave({ users, currentUserId, userName })
}

/** Switch the active user, returns updated settings */
export function userSwitch(userId: string): WebOSSettings {
  const s = settingsGet()
  const user = s.users.find((u) => u.id === userId)
  if (!user) return s
  return settingsSave({ currentUserId: userId, userName: user.name })
}

/** Get the current active user */
export function userGetCurrent(): UserProfile | undefined {
  const s = settingsGet()
  return s.users.find((u) => u.id === s.currentUserId)
}

/** Get all users */
export function userListAll(): UserProfile[] {
  return settingsGet().users
}

// ─── Desktop API ────────────────────────────────────────────────────────────

/** Create a new desktop, returns the config */
export function desktopCreate(name: string, wallpaper?: string): DesktopConfig {
  const s = settingsGet()
  const desktop: DesktopConfig = {
    id: `desktop-${Date.now()}`,
    name,
    wallpaper: wallpaper || s.wallpaper,
    iconLayout: [],
  }
  settingsSave({ desktops: [...s.desktops, desktop] })
  return desktop
}

/** Delete a desktop (must keep at least one) */
export function desktopDelete(desktopId: string): void {
  const s = settingsGet()
  if (s.desktops.length <= 1) return
  const desktops = s.desktops.filter((d) => d.id !== desktopId)
  const currentDesktopId = s.currentDesktopId === desktopId ? desktops[0].id : s.currentDesktopId
  settingsSave({ desktops, currentDesktopId })
}

/** Switch the active desktop, returns updated settings */
export function desktopSwitch(desktopId: string): WebOSSettings {
  const s = settingsGet()
  const desktop = s.desktops.find((d) => d.id === desktopId)
  if (!desktop) return s
  return settingsSave({ currentDesktopId: desktopId, wallpaper: desktop.wallpaper })
}

/** Get the current active desktop */
export function desktopGetCurrent(): DesktopConfig | undefined {
  const s = settingsGet()
  return s.desktops.find((d) => d.id === s.currentDesktopId)
}

/** Rename a desktop */
export function desktopRename(desktopId: string, newName: string): void {
  const s = settingsGet()
  const desktops = s.desktops.map((d) => d.id === desktopId ? { ...d, name: newName } : d)
  settingsSave({ desktops })
}

/** Get all desktops */
export function desktopListAll(): DesktopConfig[] {
  return settingsGet().desktops
}

/** Update wallpaper for a specific desktop */
export function desktopSetWallpaper(desktopId: string, wallpaper: string): void {
  const s = settingsGet()
  const desktops = s.desktops.map((d) => d.id === desktopId ? { ...d, wallpaper } : d)
  const wp = s.currentDesktopId === desktopId ? wallpaper : s.wallpaper
  settingsSave({ desktops, wallpaper: wp })
}

// ─── App Launch API ─────────────────────────────────────────────────────────

/** Open an app by ID (fires custom event consumed by webos-main) */
export function appOpen(appId: string, props?: Record<string, unknown>): void {
  window.dispatchEvent(new CustomEvent("webos-open-app", { detail: { appId, props } }))
}

/** Open an HTML file in the HTML runner */
export function appOpenHtml(content: string, fileName: string): void {
  window.dispatchEvent(new CustomEvent("webos-open-html", { detail: { content, fileName } }))
}

// ─── Clipboard API ──────────────────────────────────────────────────────────

/** Copy text to the system clipboard */
export async function clipboardCopy(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Fallback
    const ta = document.createElement("textarea")
    ta.value = text
    ta.style.position = "fixed"
    ta.style.opacity = "0"
    document.body.appendChild(ta)
    ta.select()
    document.execCommand("copy")
    document.body.removeChild(ta)
  }
}

// ─── System API ─────────────────────────────────────────────────────────────

/** Lock the screen */
export function systemLock(): void {
  window.dispatchEvent(new Event("webos-lock"))
}

/** Show the welcome / app-launcher screen */
export function systemShowWelcome(): void {
  window.dispatchEvent(new Event("webos-show-welcome"))
}

/** Show the desktop manager overlay */
export function systemShowDesktopManager(): void {
  window.dispatchEvent(new Event("webos-show-desktop-manager"))
}

/** Detect if current device is mobile */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false
  return window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
}
