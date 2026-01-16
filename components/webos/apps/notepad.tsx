"use client"

import { useState } from "react"
import { Save, FileText } from "lucide-react"

export function Notepad() {
  const [content, setContent] = useState("")
  const [fileName, setFileName] = useState("未命名.txt")

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="h-10 bg-secondary/30 border-b border-border flex items-center gap-1 px-2">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-secondary/50 transition-colors text-sm text-foreground">
          <FileText className="w-4 h-4" />
          文件
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-secondary/50 transition-colors text-sm text-foreground">
          编辑
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-secondary/50 transition-colors text-sm text-foreground">
          格式
        </button>
        <div className="flex-1" />
        <button className="p-2 rounded hover:bg-secondary/50 transition-colors">
          <Save className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 bg-card p-4 text-foreground font-mono text-sm resize-none outline-none"
        placeholder="开始输入..."
      />

      {/* Status Bar */}
      <div className="h-6 bg-secondary/30 border-t border-border flex items-center justify-between px-3 text-xs text-muted-foreground">
        <span>{fileName}</span>
        <span>字数: {content.length}</span>
      </div>
    </div>
  )
}
