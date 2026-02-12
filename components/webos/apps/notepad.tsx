"use client"

import { useState } from "react"
import { Save, FileText, FolderOpen, FilePlus } from "lucide-react"
import { createFile, getFiles } from "@/lib/virtual-fs"

export function Notepad() {
  const [content, setContent] = useState("")
  const [fileName, setFileName] = useState("未命名.txt")
  const [isSaved, setIsSaved] = useState(true)
  const [showMenu, setShowMenu] = useState<string | null>(null)

  const handleContentChange = (value: string) => {
    setContent(value)
    setIsSaved(false)
  }

  const handleSave = async () => {
    await createFile({
      name: fileName,
      type: "file",
      parentId: "documents",
      content,
      mimeType: "text/plain",
      size: new Blob([content]).size,
    })
    setIsSaved(true)
  }

  const handleNew = () => {
    setContent("")
    setFileName("未命名.txt")
    setIsSaved(true)
  }

  const handleOpen = async () => {
    const files = await getFiles("documents")
    const textFiles = files.filter((f) => f.type === "file" && f.name.endsWith(".txt"))
    if (textFiles.length === 0) {
      alert("文档文件夹中没有文本文件")
      return
    }
    const selected = textFiles[0]
    setFileName(selected.name)
    setContent(selected.content || "")
    setIsSaved(true)
  }

  return (
    <div className="h-full flex flex-col bg-[oklch(0.12_0.01_250)]">
      {/* Menu Bar */}
      <div className="h-10 bg-black/30 border-b border-white/10 flex items-center gap-1 px-2">
        <div className="relative">
          <button
            onClick={() => setShowMenu(showMenu === "file" ? null : "file")}
            className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white/10 transition-colors text-sm text-white"
          >
            <FileText className="w-4 h-4" />
            文件
          </button>
          {showMenu === "file" && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(null)} />
              <div className="absolute top-full left-0 mt-1 w-40 bg-black/90 backdrop-blur-xl rounded-lg border border-white/10 py-1 z-50">
                <button
                  onClick={() => {
                    handleNew()
                    setShowMenu(null)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10"
                >
                  <FilePlus className="w-4 h-4" />
                  新建
                </button>
                <button
                  onClick={() => {
                    handleOpen()
                    setShowMenu(null)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10"
                >
                  <FolderOpen className="w-4 h-4" />
                  打开
                </button>
                <button
                  onClick={() => {
                    handleSave()
                    setShowMenu(null)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
              </div>
            </>
          )}
        </div>
        <button className="px-3 py-1.5 rounded hover:bg-white/10 transition-colors text-sm text-white">编辑</button>
        <button className="px-3 py-1.5 rounded hover:bg-white/10 transition-colors text-sm text-white">格式</button>
        <div className="flex-1" />
        <button onClick={handleSave} className="p-2 rounded hover:bg-white/10 transition-colors" title="保存">
          <Save className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        className="flex-1 bg-[oklch(0.14_0.01_250)] p-4 text-white font-mono text-sm resize-none outline-none"
        placeholder="开始输入..."
      />

      {/* Status Bar */}
      <div className="h-6 bg-black/30 border-t border-white/10 flex items-center justify-between px-3 text-xs text-white/60">
        <span>
          {fileName} {!isSaved && "(未保存)"}
        </span>
        <span>
          字数: {content.length} | 行数: {content.split("\n").length}
        </span>
      </div>
    </div>
  )
}
