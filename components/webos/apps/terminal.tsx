"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { getFiles, createFile, deleteFile } from "@/lib/virtual-fs"

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
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  const processCommand = async (cmd: string): Promise<string> => {
    const parts = cmd.trim().split(" ")
    const command = parts[0].toLowerCase()
    const args = parts.slice(1)

    switch (command) {
      case "help":
        return `可用命令:
  help      - 显示帮助信息
  clear     - 清屏
  date      - 显示当前日期时间
  whoami    - 显示当前用户
  ls        - 列出文件
  cd <dir>  - 切换目录
  pwd       - 显示当前目录
  mkdir     - 创建文件夹
  touch     - 创建文件
  rm        - 删除文件
  cat       - 查看文件内容
  echo      - 输出文本
  version   - 显示版本信息
  neofetch  - 显示系统信息`
      case "clear":
        setHistory([])
        return ""
      case "date":
        return new Date().toLocaleString("zh-CN")
      case "whoami":
        return "user@webos"
      case "pwd":
        return `/${currentDir}`
      case "version":
        return "WebOS Terminal v2.0.0"
      case "ls": {
        const files = await getFiles(currentDir)
        if (files.length === 0) return "(空目录)"
        return files.map((f) => `${f.type === "folder" ? "📁" : "📄"} ${f.name}`).join("\n")
      }
      case "cd": {
        const target = args[0]
        if (!target || target === "~") {
          setCurrentDir("home")
          return ""
        }
        if (target === "..") {
          setCurrentDir("home")
          return ""
        }
        const files = await getFiles(currentDir)
        const folder = files.find((f) => f.name === target && f.type === "folder")
        if (folder) {
          setCurrentDir(folder.id)
          return ""
        }
        return `cd: ${target}: 目录不存在`
      }
      case "mkdir": {
        const name = args[0]
        if (!name) return "用法: mkdir <目录名>"
        await createFile({ name, type: "folder", parentId: currentDir, size: 0 })
        return `已创建目录: ${name}`
      }
      case "touch": {
        const name = args[0]
        if (!name) return "用法: touch <文件名>"
        await createFile({ name, type: "file", parentId: currentDir, content: "", mimeType: "text/plain", size: 0 })
        return `已创建文件: ${name}`
      }
      case "rm": {
        const name = args[0]
        if (!name) return "用法: rm <文件名>"
        const files = await getFiles(currentDir)
        const file = files.find((f) => f.name === name)
        if (!file) return `rm: ${name}: 文件不存在`
        await deleteFile(file.id)
        return `已删除: ${name}`
      }
      case "cat": {
        const name = args[0]
        if (!name) return "用法: cat <文件名>"
        const files = await getFiles(currentDir)
        const file = files.find((f) => f.name === name && f.type === "file")
        if (!file) return `cat: ${name}: 文件不存在`
        return file.content || "(空文件)"
      }
      case "neofetch":
        return `
       ▄▄▄▄▄▄▄▄▄▄▄▄▄▄       user@webos
      ▐░░░░░░░░░░░░░▌      ─────────────
      ▐░█▀▀▀▀▀▀▀▀▀█░▌      OS: WebOS 2.0
      ▐░█         █░▌      Kernel: Browser
      ▐░█  WEB    █░▌      Shell: websh
      ▐░█  OS     █░▌      Resolution: ${window.innerWidth}x${window.innerHeight}
      ▐░█         █░▌      Terminal: WebOS Term
      ▐░█▄▄▄▄▄▄▄▄▄█░▌      Storage: IndexedDB
      ▐░░░░░░░░░░░░░▌      Memory: Virtual
       ▀▀▀▀▀▀▀▀▀▀▀▀▀`
      default:
        if (command.startsWith("echo ")) {
          return cmd.slice(5)
        }
        if (command === "") {
          return ""
        }
        return `命令未找到: ${command}. 输入 'help' 查看可用命令.`
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const output = await processCommand(currentInput)
    if (output !== "" || currentInput.trim().toLowerCase() !== "clear") {
      setHistory((prev) => [...prev, { command: currentInput, output }])
    }
    setCurrentInput("")
  }

  const getDirName = () => {
    if (currentDir === "home") return "~"
    return currentDir.split("-")[0]
  }

  return (
    <div
      className="h-full bg-[#0d1117] p-4 font-mono text-sm overflow-auto"
      ref={terminalRef}
      onClick={() => inputRef.current?.focus()}
    >
      {history.map((item, index) => (
        <div key={index} className="mb-2">
          {item.command && (
            <div className="flex gap-2 flex-wrap">
              <span className="text-green-400">user@webos</span>
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
        <span className="text-green-400">user@webos</span>
        <span className="text-white/50">:</span>
        <span className="text-blue-400">{getDirName()}</span>
        <span className="text-white/50">$</span>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          className="flex-1 min-w-[100px] bg-transparent text-white outline-none"
          autoFocus
        />
      </form>
    </div>
  )
}
