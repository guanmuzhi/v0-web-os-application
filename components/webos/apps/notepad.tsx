"use client"

import { useState, useEffect } from "react"
import { Save, FileText, FolderOpen, FilePlus, Download } from "lucide-react"
import { fileCreate, fileList, fileWrite, fileRead, clipboardCopy, type VirtualFile } from "@/lib/webos-api"

interface NotepadProps {
  windowProps?: {
    content?: string
    fileName?: string
    fileId?: string
  }
}

export function Notepad({ windowProps }: NotepadProps) {
  const [content, setContent] = useState(windowProps?.content || "")
  const [fileName, setFileName] = useState(windowProps?.fileName || "未命名.txt")
  const [fileId, setFileId] = useState(windowProps?.fileId || "")
  const [isSaved, setIsSaved] = useState(true)
  const [showMenu, setShowMenu] = useState<string | null>(null)
  const [showOpenDialog, setShowOpenDialog] = useState(false)
  const [availableFiles, setAvailableFiles] = useState<VirtualFile[]>([])
  const [wordCount, setWordCount] = useState(0)

  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0
    setWordCount(words)
  }, [content])

  const handleContentChange = (value: string) => {
    setContent(value)
    setIsSaved(false)
  }

  const handleSave = async () => {
    if (fileId) {
      await fileWrite(fileId, content)
    } else {
      const newFile = await fileCreate({ name: fileName, type: "file", parentId: "documents", content, mimeType: "text/plain", size: new Blob([content]).size })
      setFileId(newFile.id)
    }
    setIsSaved(true)
  }

  const handleNew = () => { setContent(""); setFileName("未命名.txt"); setFileId(""); setIsSaved(true) }

  const handleOpenDialog = async () => {
    const docs = await fileList("documents")
    const home = await fileList("home")
    const all = [...docs, ...home].filter((f) => f.type === "file" && (f.name.endsWith(".txt") || f.name.endsWith(".md") || f.name.endsWith(".html") || f.name.endsWith(".css") || f.name.endsWith(".js")))
    setAvailableFiles(all)
    setShowOpenDialog(true)
    setShowMenu(null)
  }

  const handleOpenFile = async (file: VirtualFile) => {
    const content = await fileRead(file.id)
    setFileName(file.name)
    setContent(content)
    setFileId(file.id)
    setIsSaved(true)
    setShowOpenDialog(false)
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = fileName; a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopyAll = () => { clipboardCopy(content) }

  return (
    <div className="h-full flex flex-col bg-[oklch(0.12_0.01_250)]">
      {/* Menu Bar */}
      <div className="h-10 bg-black/30 border-b border-white/10 flex items-center gap-1 px-2">
        <div className="relative">
          <button onClick={() => setShowMenu(showMenu === "file" ? null : "file")} className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white/10 transition-colors text-sm text-white">
            <FileText className="w-4 h-4" />文件
          </button>
          {showMenu === "file" && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(null)} />
              <div className="absolute top-full left-0 mt-1 w-44 bg-black/90 backdrop-blur-xl rounded-lg border border-white/10 py-1 z-50">
                <button onClick={() => { handleNew(); setShowMenu(null) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10"><FilePlus className="w-4 h-4" />新建</button>
                <button onClick={handleOpenDialog} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10"><FolderOpen className="w-4 h-4" />打开</button>
                <button onClick={() => { handleSave(); setShowMenu(null) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10"><Save className="w-4 h-4" />保存</button>
                <div className="h-px bg-white/10 my-1" />
                <button onClick={() => { handleDownload(); setShowMenu(null) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10"><Download className="w-4 h-4" />下载到本机</button>
              </div>
            </>
          )}
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(showMenu === "edit" ? null : "edit")} className="px-3 py-1.5 rounded hover:bg-white/10 transition-colors text-sm text-white">编辑</button>
          {showMenu === "edit" && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(null)} />
              <div className="absolute top-full left-0 mt-1 w-40 bg-black/90 backdrop-blur-xl rounded-lg border border-white/10 py-1 z-50">
                <button onClick={() => { handleCopyAll(); setShowMenu(null) }} className="w-full px-3 py-2 text-sm text-white hover:bg-white/10 text-left">全选复制</button>
                <button onClick={() => { setContent(""); setShowMenu(null) }} className="w-full px-3 py-2 text-sm text-white hover:bg-white/10 text-left">清空</button>
              </div>
            </>
          )}
        </div>
        <div className="flex-1" />
        <button onClick={handleSave} className="p-2 rounded hover:bg-white/10 transition-colors" title="保存"><Save className="w-4 h-4 text-white/70" /></button>
      </div>

      {/* Editor */}
      <textarea value={content} onChange={(e) => handleContentChange(e.target.value)} className="flex-1 bg-[oklch(0.14_0.01_250)] p-4 text-white font-mono text-sm resize-none outline-none leading-relaxed" placeholder="开始输入..." />

      {/* Status Bar */}
      <div className="h-6 bg-black/30 border-t border-white/10 flex items-center justify-between px-3 text-xs text-white/60">
        <span>{fileName} {!isSaved && "(未保存)"}</span>
        <span>字符: {content.length} | 词数: {wordCount} | 行数: {content.split("\n").length}</span>
      </div>

      {/* Open File Dialog */}
      {showOpenDialog && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowOpenDialog(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="w-80 max-h-80 bg-[oklch(0.15_0.01_250)] rounded-xl border border-white/10 overflow-hidden pointer-events-auto">
              <div className="px-4 py-3 border-b border-white/10"><h3 className="text-sm font-medium text-white">打开文件</h3></div>
              <div className="max-h-60 overflow-auto p-2">
                {availableFiles.length === 0 ? (
                  <p className="text-sm text-white/40 text-center py-8">没有可打开的文件</p>
                ) : availableFiles.map((file) => (
                  <button key={file.id} onClick={() => handleOpenFile(file)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10 transition-colors">
                    <FileText className="w-4 h-4 text-white/60" />{file.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
