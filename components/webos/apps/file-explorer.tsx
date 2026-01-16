"use client"

import { useState } from "react"
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
} from "lucide-react"

const folders = [
  { name: "主目录", icon: <Home className="w-4 h-4" />, items: 12 },
  { name: "下载", icon: <Download className="w-4 h-4" />, items: 8 },
  { name: "文档", icon: <FileText className="w-4 h-4" />, items: 24 },
  { name: "图片", icon: <ImageIcon className="w-4 h-4" />, items: 156 },
  { name: "音乐", icon: <Music className="w-4 h-4" />, items: 89 },
  { name: "视频", icon: <Video className="w-4 h-4" />, items: 34 },
]

const files = [
  { name: "项目报告.docx", type: "document", size: "2.4 MB", date: "2024-01-10" },
  { name: "设计稿.png", type: "image", size: "4.8 MB", date: "2024-01-09" },
  { name: "演示文稿.pptx", type: "document", size: "12.3 MB", date: "2024-01-08" },
  { name: "数据分析.xlsx", type: "document", size: "1.2 MB", date: "2024-01-07" },
  { name: "背景音乐.mp3", type: "audio", size: "5.6 MB", date: "2024-01-06" },
  { name: "产品视频.mp4", type: "video", size: "156 MB", date: "2024-01-05" },
  { name: "会议记录.txt", type: "document", size: "24 KB", date: "2024-01-04" },
  { name: "用户头像.jpg", type: "image", size: "892 KB", date: "2024-01-03" },
]

const getFileIcon = (type: string) => {
  switch (type) {
    case "document":
      return <FileText className="w-8 h-8 text-blue-400" />
    case "image":
      return <ImageIcon className="w-8 h-8 text-green-400" />
    case "audio":
      return <Music className="w-8 h-8 text-orange-400" />
    case "video":
      return <Video className="w-8 h-8 text-red-400" />
    default:
      return <File className="w-8 h-8 text-muted-foreground" />
  }
}

export function FileExplorer() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedFolder, setSelectedFolder] = useState("主目录")

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-48 bg-secondary/30 border-r border-border p-2 flex flex-col gap-1">
        <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">快速访问</div>
        {folders.slice(0, 4).map((folder) => (
          <button
            key={folder.name}
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors",
              selectedFolder === folder.name
                ? "bg-primary/20 text-foreground"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
            )}
            onClick={() => setSelectedFolder(folder.name)}
          >
            {folder.icon}
            <span>{folder.name}</span>
          </button>
        ))}

        <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium mt-4">收藏夹</div>
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors">
          <Star className="w-4 h-4" />
          <span>收藏</span>
        </button>
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors">
          <Trash2 className="w-4 h-4" />
          <span>回收站</span>
        </button>

        <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium mt-4">设备</div>
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors">
          <HardDrive className="w-4 h-4" />
          <span>本地磁盘</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-10 border-b border-border flex items-center justify-between px-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Home className="w-4 h-4" />
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">{selectedFolder}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              className={cn(
                "p-1.5 rounded transition-colors",
                viewMode === "grid" ? "bg-secondary" : "hover:bg-secondary/50",
              )}
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              className={cn(
                "p-1.5 rounded transition-colors",
                viewMode === "list" ? "bg-secondary" : "hover:bg-secondary/50",
              )}
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Files */}
        <div className="flex-1 p-4 overflow-auto">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4">
              {folders.map((folder) => (
                <button
                  key={folder.name}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <Folder className="w-10 h-10 text-yellow-400" />
                  <span className="text-xs text-foreground text-center">{folder.name}</span>
                </button>
              ))}
              {files.map((file) => (
                <button
                  key={file.name}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  {getFileIcon(file.type)}
                  <span className="text-xs text-foreground text-center truncate w-full">{file.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="grid grid-cols-[1fr,100px,100px] gap-4 px-3 py-2 text-xs text-muted-foreground border-b border-border">
                <span>名称</span>
                <span>大小</span>
                <span>修改日期</span>
              </div>
              {files.map((file) => (
                <button
                  key={file.name}
                  className="w-full grid grid-cols-[1fr,100px,100px] gap-4 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    {getFileIcon(file.type)}
                    <span className="text-sm text-foreground">{file.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{file.size}</span>
                  <span className="text-sm text-muted-foreground">{file.date}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
