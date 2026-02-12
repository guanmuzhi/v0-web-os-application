"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  fileList,
  fileCreate,
  fileDelete,
  fileGet,
  fileRead,
  fileWrite,
  fileRename,
  fileMove,
  fileCopy,
  fileSearch,
  fileStorageUsed,
  fileFormatSize,
  settingsGet,
  appOpenHtml,
  userGetCurrent,
  desktopGetCurrent,
  type VirtualFile,
} from "@/lib/webos-api"

interface CommandHistory {
  command: string
  output: string
}

export function TerminalApp() {
  const [history, setHistory] = useState<CommandHistory[]>([
    { command: "", output: "WebOS Terminal v2.0.0\n输入 'help' 查看可用命令\n" },
  ])
  const [currentInput, setCurrentInput] = useState("")
  const [currentDir, setCurrentDir] = useState("home")
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [cmdHistoryIndex, setCmdHistoryIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight
  }, [history])

  const processCommand = async (cmd: string): Promise<string> => {
    const parts = cmd.trim().split(/\s+/)
    const command = parts[0].toLowerCase()
    const args = parts.slice(1)

    switch (command) {
      case "help":
        return `可用命令:
  help            - 显示帮助信息
  clear           - 清屏
  date            - 显示当前日期时间
  whoami          - 显示当前用户
  ls [dir]        - 列出文件
  cd <dir>        - 切换目录
  pwd             - 显示当前目录
  mkdir <name>    - 创建文件夹
  touch <name>    - 创建文件
  rm <name>       - 删除文件
  mv <src> <dst>  - 移动/重命名文件
  cp <src> [dir]  - 复制文件
  cat <file>      - 查看文件内容
  echo <text>     - 输出文本
  write <file>    - 写入内容到文件 (echo text > file)
  find <query>    - 搜索文件
  du              - 查看存储使用情况
  open <file>     - 打开 HTML 文件
  neofetch        - 显示系统信息
  version         - 显示版本信息`

      case "clear":
        setHistory([])
        return ""

      case "date":
        return new Date().toLocaleString("zh-CN")

      case "whoami": {
        const user = userGetCurrent()
        return user ? `${user.name} (${user.id})` : "user@webos"
      }

      case "pwd":
        return `/${currentDir}`

      case "version":
        return "WebOS Terminal v2.0.0"

      case "ls": {
        const targetDir = args[0] || currentDir
        const files = await fileList(targetDir)
        if (files.length === 0) return "(空目录)"
        return files.map((f) => {
          const icon = f.type === "folder" ? "d" : "-"
          const size = f.type === "folder" ? "-" : fileFormatSize(f.size)
          return `${icon}  ${size.padEnd(10)} ${f.name}`
        }).join("\n")
      }

      case "cd": {
        const target = args[0]
        if (!target || target === "~") { setCurrentDir("home"); return "" }
        if (target === "..") { setCurrentDir("home"); return "" }
        // Check known folders
        const known = ["home", "downloads", "documents", "pictures", "music", "videos", "apps"]
        if (known.includes(target)) { setCurrentDir(target); return "" }
        const files = await fileList(currentDir)
        const folder = files.find((f) => f.name === target && f.type === "folder")
        if (folder) { setCurrentDir(folder.id); return "" }
        return `cd: ${target}: 目录不存在`
      }

      case "mkdir": {
        const name = args[0]
        if (!name) return "用法: mkdir <目录名>"
        await fileCreate({ name, type: "folder", parentId: currentDir, size: 0 })
        return `已创建目录: ${name}`
      }

      case "touch": {
        const name = args[0]
        if (!name) return "用法: touch <文件名>"
        const ext = name.split(".").pop()?.toLowerCase()
        let mimeType = "text/plain"
        if (ext === "html") mimeType = "text/html"
        else if (ext === "js") mimeType = "text/javascript"
        else if (ext === "css") mimeType = "text/css"
        await fileCreate({ name, type: "file", parentId: currentDir, content: "", mimeType, size: 0 })
        return `已创建文件: ${name}`
      }

      case "rm": {
        const name = args[0]
        if (!name) return "用法: rm <文件名>"
        const files = await fileList(currentDir)
        const file = files.find((f) => f.name === name)
        if (!file) return `rm: ${name}: 文件不存在`
        await fileDelete(file.id)
        return `已删除: ${name}`
      }

      case "mv": {
        const src = args[0]
        const dst = args[1]
        if (!src || !dst) return "用法: mv <源文件> <目标名称或目录>"
        const files = await fileList(currentDir)
        const file = files.find((f) => f.name === src)
        if (!file) return `mv: ${src}: 文件不存在`
        // Check if dst is a known directory
        const known2 = ["home", "downloads", "documents", "pictures", "music", "videos", "apps"]
        if (known2.includes(dst)) {
          await fileMove(file.id, dst)
          return `已移动: ${src} -> ${dst}/`
        }
        await fileRename(file.id, dst)
        return `已重命名: ${src} -> ${dst}`
      }

      case "cp": {
        const src = args[0]
        const dst = args[1]
        if (!src) return "用法: cp <源文件> [目标目录]"
        const files = await fileList(currentDir)
        const file = files.find((f) => f.name === src)
        if (!file) return `cp: ${src}: 文件不存在`
        await fileCopy(file.id, dst || currentDir)
        return `已复制: ${src}`
      }

      case "cat": {
        const name = args[0]
        if (!name) return "用法: cat <文件名>"
        const files = await fileList(currentDir)
        const file = files.find((f) => f.name === name && f.type === "file")
        if (!file) return `cat: ${name}: 文件不存在`
        return file.content || "(空文件)"
      }

      case "write": {
        // write filename content...
        const name = args[0]
        const content = args.slice(1).join(" ")
        if (!name) return "用法: write <文件名> <内容>"
        const files = await fileList(currentDir)
        const file = files.find((f) => f.name === name && f.type === "file")
        if (!file) return `write: ${name}: 文件不存在`
        await fileWrite(file.id, content)
        return `已写入 ${content.length} 字符到 ${name}`
      }

      case "find": {
        const query = args.join(" ")
        if (!query) return "用法: find <搜索词>"
        const results = await fileSearch(query)
        if (results.length === 0) return "未找到匹配文件"
        return results.map((f) => `${f.type === "folder" ? "d" : "-"}  ${f.name}  (${f.parentId})`).join("\n")
      }

      case "du": {
        const used = await fileStorageUsed()
        return `存储使用: ${fileFormatSize(used)}`
      }

      case "open": {
        const name = args[0]
        if (!name) return "用法: open <html文件名>"
        const files = await fileList(currentDir)
        const file = files.find((f) => f.name === name && f.type === "file")
        if (!file) return `open: ${name}: 文件不存在`
        if (file.mimeType !== "text/html") return `open: ${name}: 不是 HTML 文件`
        appOpenHtml(file.content || "", file.name)
        return `正在打开: ${name}`
      }

      case "neofetch": {
        const desktop = desktopGetCurrent()
        return `
       ▄▄▄▄▄▄▄▄▄▄▄▄▄▄       ${userGetCurrent()?.name || "user"}@webos
      ▐░░░░░░░░░░░░░▌      ─────────────
      ▐░█▀▀▀▀▀▀▀▀▀█░▌      OS: WebOS 2.0
      ▐░█         █░▌      Kernel: Browser
      ▐░█  WEB    █░▌      Shell: websh
      ▐░█  OS     █░▌      Resolution: ${window.innerWidth}x${window.innerHeight}
      ▐░█         █░▌      Terminal: WebOS Term
      ▐░█▄▄▄▄▄▄▄▄▄█░▌      Desktop: ${desktop?.name || "Desktop 1"}
      ▐░░░░░░░░░░░░░▌      Storage: IndexedDB
       ▀▀▀▀▀▀▀▀▀▀▀▀▀`
      }

      default:
        if (command.startsWith("echo")) return cmd.slice(5)
        if (command === "") return ""
        return `命令未找到: ${command}. 输入 'help' 查看可用命令.`
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const output = await processCommand(currentInput)
    if (output !== "" || currentInput.trim().toLowerCase() !== "clear") {
      setHistory((prev) => [...prev, { command: currentInput, output }])
    }
    if (currentInput.trim()) {
      setCmdHistory((prev) => [...prev, currentInput])
    }
    setCmdHistoryIndex(-1)
    setCurrentInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (cmdHistory.length > 0) {
        const newIndex = cmdHistoryIndex === -1 ? cmdHistory.length - 1 : Math.max(0, cmdHistoryIndex - 1)
        setCmdHistoryIndex(newIndex)
        setCurrentInput(cmdHistory[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (cmdHistoryIndex >= 0) {
        const newIndex = cmdHistoryIndex + 1
        if (newIndex >= cmdHistory.length) {
          setCmdHistoryIndex(-1)
          setCurrentInput("")
        } else {
          setCmdHistoryIndex(newIndex)
          setCurrentInput(cmdHistory[newIndex])
        }
      }
    }
  }

  const getDirName = () => {
    if (currentDir === "home") return "~"
    const known: Record<string, string> = { downloads: "downloads", documents: "documents", pictures: "pictures", music: "music", videos: "videos", apps: "apps" }
    return known[currentDir] || currentDir.split("-")[0]
  }

  return (
    <div className="h-full bg-[#0d1117] p-4 font-mono text-sm overflow-auto" ref={terminalRef} onClick={() => inputRef.current?.focus()}>
      {history.map((item, index) => (
        <div key={index} className="mb-2">
          {item.command && (
            <div className="flex gap-2 flex-wrap">
              <span className="text-green-400">{userGetCurrent()?.name || "user"}@webos</span>
              <span className="text-white/50">:</span>
              <span className="text-blue-400">{getDirName()}</span>
              <span className="text-white/50">$</span>
              <span className="text-white">{item.command}</span>
            </div>
          )}
          {item.output && <pre className="text-white/90 whitespace-pre-wrap mt-1">{item.output}</pre>}
        </div>
      ))}

      <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap">
        <span className="text-green-400">{userGetCurrent()?.name || "user"}@webos</span>
        <span className="text-white/50">:</span>
        <span className="text-blue-400">{getDirName()}</span>
        <span className="text-white/50">$</span>
        <input ref={inputRef} type="text" value={currentInput} onChange={(e) => setCurrentInput(e.target.value)} onKeyDown={handleKeyDown} className="flex-1 min-w-[100px] bg-transparent text-white outline-none" autoFocus />
      </form>
    </div>
  )
}
