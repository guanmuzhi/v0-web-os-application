"use client"

import React from "react"

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
  Folder,
  File,
  ImageIcon,
  Music,
  Video,
  FileText,
  ChevronRight,
  Home,
  Download,
  Star,
  Trash2,
  HardDrive,
  Grid,
  List,
  Plus,
  Upload,
  Code,
  ArrowLeft,
  Edit3,
  Copy,
  Scissors,
  ClipboardPaste,
  Search,
} from "lucide-react"
import {
  fileList,
  fileCreate,
  fileDelete,
  fileRename,
  fileMove,
  fileCopy,
  fileSearch,
  fileFormatSize,
  fileStorageUsed,
  appOpenHtml,
  appOpen,
  type VirtualFile,
} from "@/lib/webos-api"

const sidebarFolders = [
  { id: "home", name: "主目录", icon: <Home className="w-4 h-4" /> },
  { id: "downloads", name: "下载", icon: <Download className="w-4 h-4" /> },
  { id: "documents", name: "文档", icon: <FileText className="w-4 h-4" /> },
  { id: "pictures", name: "图片", icon: <ImageIcon className="w-4 h-4" /> },
  { id: "music", name: "音乐", icon: <Music className="w-4 h-4" /> },
  { id: "videos", name: "视频", icon: <Video className="w-4 h-4" /> },
  { id: "apps", name: "应用", icon: <Code className="w-4 h-4" /> },
]

const getFileIcon = (file: VirtualFile) => {
  if (file.type === "folder") return <Folder className="w-8 h-8 text-yellow-400" />
  const ext = file.name.split(".").pop()?.toLowerCase()
  switch (ext) {
    case "txt": case "doc": case "pdf": return <FileText className="w-8 h-8 text-blue-400" />
    case "png": case "jpg": case "jpeg": case "gif": case "webp": return <ImageIcon className="w-8 h-8 text-green-400" />
    case "mp3": case "wav": case "ogg": return <Music className="w-8 h-8 text-orange-400" />
    case "mp4": case "webm": case "avi": return <Video className="w-8 h-8 text-red-400" />
    case "html": case "js": case "css": return <Code className="w-8 h-8 text-cyan-400" />
    default: return <File className="w-8 h-8 text-gray-400" />
  }
}

export function FileExplorer() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentFolderId, setCurrentFolderId] = useState("home")
  const [files, setFiles] = useState<VirtualFile[]>([])
  const [pathStack, setPathStack] = useState<string[]>(["home"])
  const [isLoading, setIsLoading] = useState(true)
  const [contextFile, setContextFile] = useState<VirtualFile | null>(null)
  const [contextPos, setContextPos] = useState<{ x: number; y: number } | null>(null)
  const [clipboard, setClipboard] = useState<{ file: VirtualFile; action: "copy" | "cut" } | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<VirtualFile[] | null>(null)
  const [storageUsed, setStorageUsed] = useState(0)

  const loadFiles = useCallback(async () => {
    setIsLoading(true)
    try {
      const loaded = await fileList(currentFolderId)
      setFiles(loaded)
      const used = await fileStorageUsed()
      setStorageUsed(used)
    } catch (err) {
      console.error("Failed to load files:", err)
    }
    setIsLoading(false)
  }, [currentFolderId])

  useEffect(() => { loadFiles() }, [loadFiles])

  const navigateToFolder = (folderId: string, fromSidebar = false) => {
    setSearchResults(null)
    setSearchQuery("")
    if (fromSidebar) setPathStack([folderId])
    else setPathStack((prev) => [...prev, folderId])
    setCurrentFolderId(folderId)
  }

  const goBack = () => {
    if (pathStack.length > 1) {
      const newStack = pathStack.slice(0, -1)
      setPathStack(newStack)
      setCurrentFolderId(newStack[newStack.length - 1])
    }
  }

  const handleFileDoubleClick = (file: VirtualFile) => {
    if (file.type === "folder") { navigateToFolder(file.id); return }
    if (file.mimeType === "text/html" && file.content) {
      appOpenHtml(file.content, file.name)
    } else if (file.mimeType === "text/plain" || file.name.endsWith(".txt")) {
      appOpen("notepad", { content: file.content, fileName: file.name, fileId: file.id })
    }
  }

  const handleCreateFolder = async () => {
    const name = prompt("输入文件夹名称:")
    if (!name) return
    await fileCreate({ name, type: "folder", parentId: currentFolderId, size: 0 })
    loadFiles()
  }

  const handleCreateFile = async () => {
    const name = prompt("输入文件名称 (如: test.txt):")
    if (!name) return
    const ext = name.split(".").pop()?.toLowerCase()
    let mimeType = "text/plain"
    if (ext === "html") mimeType = "text/html"
    else if (ext === "js") mimeType = "text/javascript"
    else if (ext === "css") mimeType = "text/css"
    await fileCreate({ name, type: "file", parentId: currentFolderId, content: "", mimeType, size: 0 })
    loadFiles()
  }

  const handleDeleteFile = async (file: VirtualFile) => {
    if (!confirm(`确定要删除 "${file.name}" 吗?`)) return
    await fileDelete(file.id)
    loadFiles()
  }

  const handleRename = async () => {
    if (!renamingId || !renameValue.trim()) { setRenamingId(null); return }
    await fileRename(renamingId, renameValue.trim())
    setRenamingId(null)
    setRenameValue("")
    loadFiles()
  }

  const handleCopy = (file: VirtualFile) => { setClipboard({ file, action: "copy" }); setContextPos(null) }
  const handleCut = (file: VirtualFile) => { setClipboard({ file, action: "cut" }); setContextPos(null) }

  const handlePaste = async () => {
    if (!clipboard) return
    if (clipboard.action === "copy") {
      await fileCopy(clipboard.file.id, currentFolderId)
    } else {
      await fileMove(clipboard.file.id, currentFolderId)
      setClipboard(null)
    }
    setContextPos(null)
    loadFiles()
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) { setSearchResults(null); return }
    const results = await fileSearch(searchQuery)
    setSearchResults(results)
  }

  const handleContextMenu = (e: React.MouseEvent, file: VirtualFile) => {
    e.preventDefault()
    e.stopPropagation()
    setContextFile(file)
    setContextPos({ x: e.clientX, y: e.clientY })
  }

  const currentFolder = sidebarFolders.find((f) => f.id === currentFolderId)
  const displayFiles = searchResults ?? files

  return (
    <div className="h-full flex bg-[oklch(0.12_0.01_250)]">
      {/* Sidebar */}
      <div className="w-48 bg-black/20 border-r border-white/10 p-2 flex flex-col gap-1">
        <div className="px-2 py-1.5 text-xs text-white/50 font-medium">快速访问</div>
        {sidebarFolders.map((folder) => (
          <button key={folder.id} className={cn("flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors", currentFolderId === folder.id ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white")} onClick={() => navigateToFolder(folder.id, true)}>
            {folder.icon}
            <span>{folder.name}</span>
          </button>
        ))}
        <div className="px-2 py-1.5 text-xs text-white/50 font-medium mt-4">收藏夹</div>
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors"><Star className="w-4 h-4" /><span>收藏</span></button>
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors"><Trash2 className="w-4 h-4" /><span>回收站</span></button>
        <div className="mt-auto px-2 py-2 text-xs text-white/40">
          <HardDrive className="w-3 h-3 inline mr-1" />
          已用: {fileFormatSize(storageUsed)}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-11 border-b border-white/10 flex items-center justify-between px-3 bg-black/20">
          <div className="flex items-center gap-2">
            <button onClick={goBack} disabled={pathStack.length <= 1} className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 transition-colors">
              <ArrowLeft className="w-4 h-4 text-white/70" />
            </button>
            <div className="flex items-center gap-1 text-sm text-white/60">
              <Home className="w-4 h-4" /><ChevronRight className="w-3 h-3" />
              <span className="text-white">{currentFolder?.name || "文件夹"}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Search */}
            <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
              <Search className="w-3.5 h-3.5 text-white/40" />
              <input type="text" placeholder="搜索..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="bg-transparent text-xs text-white outline-none w-20 placeholder:text-white/30" />
            </div>
            <div className="w-px h-4 bg-white/20 mx-1" />
            <button onClick={handleCreateFolder} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="新建文件夹"><Plus className="w-4 h-4 text-white/70" /></button>
            <button onClick={handleCreateFile} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="新建文件"><Upload className="w-4 h-4 text-white/70" /></button>
            {clipboard && (
              <button onClick={handlePaste} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="粘贴"><ClipboardPaste className="w-4 h-4 text-green-400" /></button>
            )}
            <div className="w-px h-4 bg-white/20 mx-1" />
            <button className={cn("p-1.5 rounded transition-colors", viewMode === "grid" ? "bg-white/10" : "hover:bg-white/10")} onClick={() => setViewMode("grid")}><Grid className="w-4 h-4 text-white/70" /></button>
            <button className={cn("p-1.5 rounded transition-colors", viewMode === "list" ? "bg-white/10" : "hover:bg-white/10")} onClick={() => setViewMode("list")}><List className="w-4 h-4 text-white/70" /></button>
          </div>
        </div>

        {/* Files */}
        <div className="flex-1 p-4 overflow-auto" onClick={() => setContextPos(null)}>
          {searchResults && (
            <div className="mb-3 flex items-center gap-2 text-xs text-white/50">
              <span>搜索结果: {searchResults.length} 个文件</span>
              <button onClick={() => { setSearchResults(null); setSearchQuery("") }} className="text-primary hover:underline">清除</button>
            </div>
          )}
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-white/50">加载中...</div>
          ) : displayFiles.length === 0 ? (
            <div className="h-full flex items-center justify-center text-white/50">{searchResults ? "未找到匹配文件" : "文件夹为空"}</div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-3">
              {displayFiles.map((file) => (
                <button key={file.id} className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/10 transition-colors group" onDoubleClick={() => handleFileDoubleClick(file)} onContextMenu={(e) => handleContextMenu(e, file)}>
                  {getFileIcon(file)}
                  {renamingId === file.id ? (
                    <input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onBlur={handleRename} onKeyDown={(e) => e.key === "Enter" && handleRename()} className="text-xs text-white bg-white/10 rounded px-1 py-0.5 outline-none text-center w-full" />
                  ) : (
                    <span className="text-xs text-white text-center truncate w-full">{file.name}</span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="grid grid-cols-[1fr,100px,120px] gap-4 px-3 py-2 text-xs text-white/50 border-b border-white/10">
                <span>名称</span><span>大小</span><span>修改日期</span>
              </div>
              {displayFiles.map((file) => (
                <button key={file.id} className="w-full grid grid-cols-[1fr,100px,120px] gap-4 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-left" onDoubleClick={() => handleFileDoubleClick(file)} onContextMenu={(e) => handleContextMenu(e, file)}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">{getFileIcon(file)}</div>
                    {renamingId === file.id ? (
                      <input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onBlur={handleRename} onKeyDown={(e) => e.key === "Enter" && handleRename()} className="text-sm text-white bg-white/10 rounded px-1 outline-none" />
                    ) : (
                      <span className="text-sm text-white truncate">{file.name}</span>
                    )}
                  </div>
                  <span className="text-sm text-white/60">{file.type === "folder" ? "-" : fileFormatSize(file.size)}</span>
                  <span className="text-sm text-white/60">{new Date(file.modifiedAt).toLocaleDateString("zh-CN")}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextPos && contextFile && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setContextPos(null)} />
          <div className="fixed bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl py-1.5 min-w-[160px] z-[101]" style={{ left: Math.min(contextPos.x, window.innerWidth - 180), top: Math.min(contextPos.y, window.innerHeight - 280) }}>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-white/10" onClick={() => { handleFileDoubleClick(contextFile); setContextPos(null) }}>
              <File className="w-4 h-4 text-white/60" />打开
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-white/10" onClick={() => { setRenamingId(contextFile.id); setRenameValue(contextFile.name); setContextPos(null) }}>
              <Edit3 className="w-4 h-4 text-white/60" />重命名
            </button>
            <div className="h-px bg-white/10 my-1" />
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-white/10" onClick={() => handleCopy(contextFile)}>
              <Copy className="w-4 h-4 text-white/60" />复制
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-white/10" onClick={() => handleCut(contextFile)}>
              <Scissors className="w-4 h-4 text-white/60" />剪切
            </button>
            <div className="h-px bg-white/10 my-1" />
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-white/10" onClick={() => { handleDeleteFile(contextFile); setContextPos(null) }}>
              <Trash2 className="w-4 h-4" />删除
            </button>
          </div>
        </>
      )}
    </div>
  )
}
