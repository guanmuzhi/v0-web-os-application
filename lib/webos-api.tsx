/**
 * WebOS Centralized API Module
 * ============================
 * All system functions are encapsulated here for easy reuse across apps.
 * Categories: File, Desktop, User, Window, Settings, App, Wallpaper, Clipboard, Notification
 */

// ─── Re-export types ─────────────────────────────────────────────────────────
export type {
  UserProfile,
  DesktopConfig,
  WebOSSettings,
  AppDefinition,
  WindowState,
} from "./webos-store"

import {
  getSettings,
  saveSettings,
  getDefaultWallpapers,
  createUser as _createUser,
  deleteUser as _deleteUser,
  switchUser as _switchUser,
  createDesktop as _createDesktop,
  deleteDesktop as _deleteDesktop,
  switchDesktop as _switchDesktop,
  type UserProfile,
  type DesktopConfig,
  type WebOSSettings,
  type AppDefinition,
  type WindowState,
} from "./webos-store"

// ═══════════════════════════════════════════════════════════════════════════════
// 1. FILE SYSTEM API
// ═══════════════════════════════════════════════════════════════════════════════

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

interface CreateFileOptions {
  name: string
  type: "file" | "folder"
  parentId: string
  content?: string
  mimeType?: string
  size: number
}

const DB_NAME = "webos-fs"
const DB_VERSION = 1
const STORE_NAME = "files"

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" })
        store.createIndex("parentId", "parentId", { unique: false })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

let hasSeeded = false

async function seedDefaultFiles(db: IDBDatabase): Promise<void> {
  if (hasSeeded) return
  const tx = db.transaction(STORE_NAME, "readonly")
  const store = tx.objectStore(STORE_NAME)
  const count = await new Promise<number>((resolve) => {
    const req = store.count()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => resolve(0)
  })

  if (count > 0) {
    hasSeeded = true
    return
  }
  hasSeeded = true

  const now = Date.now()
  const defaults: VirtualFile[] = [
    { id: "home", name: "主目录", type: "folder", parentId: "root", size: 0, createdAt: now, modifiedAt: now },
    { id: "downloads", name: "下载", type: "folder", parentId: "root", size: 0, createdAt: now, modifiedAt: now },
    { id: "documents", name: "文档", type: "folder", parentId: "root", size: 0, createdAt: now, modifiedAt: now },
    { id: "pictures", name: "图片", type: "folder", parentId: "root", size: 0, createdAt: now, modifiedAt: now },
    { id: "music", name: "音乐", type: "folder", parentId: "root", size: 0, createdAt: now, modifiedAt: now },
    { id: "videos", name: "视频", type: "folder", parentId: "root", size: 0, createdAt: now, modifiedAt: now },
    { id: "apps", name: "应用", type: "folder", parentId: "root", size: 0, createdAt: now, modifiedAt: now },
    {
      id: "readme",
      name: "欢迎.txt",
      type: "file",
      parentId: "documents",
      content: "欢迎使用 WebOS!\n\n这是一个运行在浏览器中的虚拟操作系统。\n你可以创建文件、运行 HTML 应用、管理多个桌面。\n\n使用终端输入 help 了解更多命令。",
      mimeType: "text/plain",
      size: 120,
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "demo-app",
      name: "计数器.html",
      type: "file",
      parentId: "apps",
      content: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>计数器</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui;min-height:100vh;background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff;display:flex;align-items:center;justify-content:center}.container{text-align:center}h1{font-size:2.5rem;margin-bottom:1rem;background:linear-gradient(90deg,#00d9ff,#00ff88);-webkit-background-clip:text;-webkit-text-fill-color:transparent}button{background:linear-gradient(90deg,#00d9ff,#00ff88);border:none;padding:12px 32px;border-radius:8px;font-size:1rem;font-weight:600;color:#1a1a2e;cursor:pointer;transition:transform .2s}button:hover{transform:translateY(-2px)}.count{font-size:5rem;margin:1rem 0;font-weight:bold}</style>
</head><body><div class="container"><h1>计数器应用</h1><div class="count" id="c">0</div><button onclick="document.getElementById('c').textContent=++n">点击 +1</button></div><script>let n=0</script></body></html>`,
      mimeType: "text/html",
      size: 650,
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "demo-clock",
      name: "时钟.html",
      type: "file",
      parentId: "apps",
      content: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>时钟</title>
<style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#1a1a2e;font-family:'Courier New',monospace}.time{font-size:6rem;color:#00ff88;text-shadow:0 0 20px rgba(0,255,136,.5);text-align:center}.date{font-size:1.2rem;color:rgba(255,255,255,.6);margin-top:1rem;text-align:center}</style>
</head><body><div><div class="time" id="t"></div><div class="date" id="d"></div></div><script>setInterval(()=>{const n=new Date;document.getElementById('t').textContent=n.toLocaleTimeString('zh-CN',{hour12:false});document.getElementById('d').textContent=n.toLocaleDateString('zh-CN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})},1000)</script></body></html>`,
      mimeType: "text/html",
      size: 580,
      createdAt: now,
      modifiedAt: now,
    },
  ]

  const wtx = db.transaction(STORE_NAME, "readwrite")
  const wstore = wtx.objectStore(STORE_NAME)
  for (const file of defaults) {
    wstore.put(file)
  }
}

/** List files in a folder */
export async function fileList(parentId: string): Promise<VirtualFile[]> {
  const db = await openDB()
  await seedDefaultFiles(db)
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const index = tx.objectStore(STORE_NAME).index("parentId")
    const request = index.getAll(parentId)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/** Get a single file by id */
export async function fileGet(fileId: string): Promise<VirtualFile | undefined> {
  const db = await openDB()
  await seedDefaultFiles(db)
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const request = tx.objectStore(STORE_NAME).get(fileId)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/** Create a file or folder */
export async function fileCreate(options: CreateFileOptions): Promise<VirtualFile> {
  const db = await openDB()
  const now = Date.now()
  const file: VirtualFile = {
    id: `file-${now}-${Math.random().toString(36).slice(2, 8)}`,
    name: options.name,
    type: options.type,
    parentId: options.parentId,
    content: options.content,
    mimeType: options.mimeType,
    size: options.size,
    createdAt: now,
    modifiedAt: now,
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const request = tx.objectStore(STORE_NAME).put(file)
    request.onsuccess = () => resolve(file)
    request.onerror = () => reject(request.error)
  })
}

/** Delete a file or folder (and children recursively) */
export async function fileDelete(fileId: string): Promise<void> {
  const db = await openDB()
  // Delete children first
  const children = await fileList(fileId)
  for (const child of children) {
    await fileDelete(child.id)
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const request = tx.objectStore(STORE_NAME).delete(fileId)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/** Rename a file or folder */
export async function fileRename(fileId: string, newName: string): Promise<VirtualFile | undefined> {
  const file = await fileGet(fileId)
  if (!file) return undefined
  file.name = newName
  file.modifiedAt = Date.now()
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const request = tx.objectStore(STORE_NAME).put(file)
    request.onsuccess = () => resolve(file)
    request.onerror = () => reject(request.error)
  })
}

/** Move a file to another folder */
export async function fileMove(fileId: string, newParentId: string): Promise<VirtualFile | undefined> {
  const file = await fileGet(fileId)
  if (!file) return undefined
  file.parentId = newParentId
  file.modifiedAt = Date.now()
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const request = tx.objectStore(STORE_NAME).put(file)
    request.onsuccess = () => resolve(file)
    request.onerror = () => reject(request.error)
  })
}

/** Copy a file (creates a new file with same content) */
export async function fileCopy(fileId: string, newParentId?: string): Promise<VirtualFile | undefined> {
  const file = await fileGet(fileId)
  if (!file) return undefined
  return fileCreate({
    name: `${file.name} (副本)`,
    type: file.type,
    parentId: newParentId || file.parentId,
    content: file.content,
    mimeType: file.mimeType,
    size: file.size,
  })
}

/** Update file content */
export async function fileWrite(fileId: string, content: string): Promise<VirtualFile | undefined> {
  const file = await fileGet(fileId)
  if (!file) return undefined
  file.content = content
  file.size = new Blob([content]).size
  file.modifiedAt = Date.now()
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const request = tx.objectStore(STORE_NAME).put(file)
    request.onsuccess = () => resolve(file)
    request.onerror = () => reject(request.error)
  })
}

/** Read file content */
export async function fileRead(fileId: string): Promise<string> {
  const file = await fileGet(fileId)
  return file?.content || ""
}

/** Search files by name */
export async function fileSearch(query: string): Promise<VirtualFile[]> {
  const db = await openDB()
  await seedDefaultFiles(db)
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const request = tx.objectStore(STORE_NAME).getAll()
    request.onsuccess = () => {
      const all: VirtualFile[] = request.result
      const lq = query.toLowerCase()
      resolve(all.filter((f) => f.name.toLowerCase().includes(lq)))
    }
    request.onerror = () => reject(request.error)
  })
}

/** Get total storage used */
export async function fileStorageUsed(): Promise<number> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const request = tx.objectStore(STORE_NAME).getAll()
    request.onsuccess = () => {
      const files: VirtualFile[] = request.result
      resolve(files.reduce((sum, f) => sum + f.size, 0))
    }
    request.onerror = () => reject(request.error)
  })
}

/** Format bytes to human-readable string */
export function fileFormatSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. DESKTOP API
// ═══════════════════════════════════════════════════════════════════════════════

/** Create a new desktop */
export function desktopCreate(name: string, wallpaper?: string): DesktopConfig {
  return _createDesktop(name, wallpaper)
}

/** Delete a desktop */
export function desktopDelete(desktopId: string): void {
  _deleteDesktop(desktopId)
}

/** Switch to a desktop */
export function desktopSwitch(desktopId: string): WebOSSettings {
  return _switchDesktop(desktopId)
}

/** Rename a desktop */
export function desktopRename(desktopId: string, newName: string): WebOSSettings {
  const settings = settingsGet()
  const desktops = settings.desktops.map((d) =>
    d.id === desktopId ? { ...d, name: newName } : d
  )
  return settingsSave({ desktops })
}

/** Set wallpaper for a desktop */
export function desktopSetWallpaper(desktopId: string, wallpaper: string): WebOSSettings {
  const settings = settingsGet()
  const desktops = settings.desktops.map((d) =>
    d.id === desktopId ? { ...d, wallpaper } : d
  )
  return settingsSave({ desktops })
}

/** List all desktops */
export function desktopList(): DesktopConfig[] {
  return settingsGet().desktops
}

/** Get current desktop */
export function desktopGetCurrent(): DesktopConfig | undefined {
  const s = settingsGet()
  return s.desktops.find((d) => d.id === s.currentDesktopId)
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. USER API
// ═══════════════════════════════════════════════════════════════════════════════

/** Create a new user */
export function userCreate(name: string, color: string): UserProfile {
  return _createUser(name, color)
}

/** Delete a user */
export function userDelete(userId: string): void {
  _deleteUser(userId)
}

/** Switch to a user */
export function userSwitch(userId: string): WebOSSettings {
  return _switchUser(userId)
}

/** Rename a user */
export function userRename(userId: string, newName: string): WebOSSettings {
  const settings = settingsGet()
  const users = settings.users.map((u) =>
    u.id === userId ? { ...u, name: newName } : u
  )
  const userName = settings.currentUserId === userId ? newName : settings.userName
  return settingsSave({ users, userName })
}

/** Set user avatar */
export function userSetAvatar(userId: string, avatar: string): WebOSSettings {
  const settings = settingsGet()
  const users = settings.users.map((u) =>
    u.id === userId ? { ...u, avatar } : u
  )
  return settingsSave({ users })
}

/** Set user color */
export function userSetColor(userId: string, color: string): WebOSSettings {
  const settings = settingsGet()
  const users = settings.users.map((u) =>
    u.id === userId ? { ...u, color } : u
  )
  return settingsSave({ users })
}

/** List all users */
export function userList(): UserProfile[] {
  return settingsGet().users
}

/** Get current user */
export function userGetCurrent(): UserProfile | undefined {
  const s = settingsGet()
  return s.users.find((u) => u.id === s.currentUserId)
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. SETTINGS API
// ═══════════════════════════════════════════════════════════════════════════════

/** Get all settings */
export function settingsGet(): WebOSSettings {
  return getSettings()
}

/** Save partial settings (merges with existing) */
export function settingsSave(partial: Partial<WebOSSettings>): WebOSSettings {
  const updated = saveSettings(partial)
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("webos-settings-change", { detail: updated }))
  }
  return updated
}

/** Reset all settings to defaults */
export function settingsReset(): WebOSSettings {
  if (typeof window !== "undefined") {
    localStorage.removeItem("webos-settings")
  }
  return settingsGet()
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. WALLPAPER API
// ═══════════════════════════════════════════════════════════════════════════════

/** Get default wallpapers */
export function wallpaperListDefaults(): string[] {
  return getDefaultWallpapers()
}

/** Get all wallpapers (default + custom) */
export function wallpaperListAll(): string[] {
  const s = settingsGet()
  return [...getDefaultWallpapers(), ...s.customWallpapers]
}

/** Set current wallpaper */
export function wallpaperSet(url: string): WebOSSettings {
  return settingsSave({ wallpaper: url })
}

/** Upload a custom wallpaper from a File object, returns data URL */
export function wallpaperUpload(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const s = settingsGet()
      settingsSave({ customWallpapers: [...s.customWallpapers, dataUrl], wallpaper: dataUrl })
      resolve(dataUrl)
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/** Remove a custom wallpaper */
export function wallpaperRemoveCustom(url: string): WebOSSettings {
  const s = settingsGet()
  const customWallpapers = s.customWallpapers.filter((w) => w !== url)
  const wallpaper = s.wallpaper === url ? getDefaultWallpapers()[0] : s.wallpaper
  return settingsSave({ customWallpapers, wallpaper })
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. WINDOW MANAGEMENT API (dispatches events that WebOSMain listens to)
// ═══════════════════════════════════════════════════════════════════════════════

/** Open an app by its id */
export function appOpen(appId: string, props?: Record<string, unknown>): void {
  window.dispatchEvent(new CustomEvent("webos-open-app", { detail: { appId, props } }))
}

/** Open an HTML file in the HTML Runner */
export function appOpenHtml(content: string, fileName: string): void {
  window.dispatchEvent(new CustomEvent("webos-open-html", { detail: { content, fileName } }))
}

/** Request lock screen */
export function systemLock(): void {
  window.dispatchEvent(new CustomEvent("webos-lock"))
}

/** Request navigate to welcome screen */
export function systemShowWelcome(): void {
  window.dispatchEvent(new CustomEvent("webos-show-welcome"))
}

/** Show desktop manager modal */
export function systemShowDesktopManager(): void {
  window.dispatchEvent(new CustomEvent("webos-show-desktop-manager"))
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. CLIPBOARD API
// ═══════════════════════════════════════════════════════════════════════════════

/** Copy text to clipboard */
export async function clipboardCopy(text: string): Promise<void> {
  await navigator.clipboard.writeText(text)
}

/** Read text from clipboard */
export async function clipboardRead(): Promise<string> {
  return navigator.clipboard.readText()
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. NOTIFICATION API
// ═══════════════════════════════════════════════════════════════════════════════

interface WebOSNotification {
  id: string
  title: string
  body: string
  timestamp: number
}

const notifications: WebOSNotification[] = []

/** Send a notification */
export function notificationSend(title: string, body: string): WebOSNotification {
  const n: WebOSNotification = {
    id: `notif-${Date.now()}`,
    title,
    body,
    timestamp: Date.now(),
  }
  notifications.push(n)
  window.dispatchEvent(new CustomEvent("webos-notification", { detail: n }))
  return n
}

/** List recent notifications */
export function notificationList(): WebOSNotification[] {
  return [...notifications]
}

/** Clear all notifications */
export function notificationClear(): void {
  notifications.length = 0
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. UTILITY HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Check if the device is mobile */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false
  return window.innerWidth < 768
}

/** Get formatted date string */
export function formatDate(date?: Date, format?: "yyyy-mm-dd" | "mm-dd-yyyy" | "dd-mm-yyyy"): string {
  const d = date || new Date()
  const f = format || settingsGet().dateFormat
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  switch (f) {
    case "mm-dd-yyyy": return `${m}-${day}-${y}`
    case "dd-mm-yyyy": return `${day}-${m}-${y}`
    default: return `${y}-${m}-${day}`
  }
}

/** Get formatted time string */
export function formatTime(date?: Date, format?: "12h" | "24h"): string {
  const d = date || new Date()
  const f = format || settingsGet().timeFormat
  return d.toLocaleTimeString("zh-CN", { hour12: f === "12h", hour: "2-digit", minute: "2-digit" })
}
