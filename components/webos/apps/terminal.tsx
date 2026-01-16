"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface CommandHistory {
  command: string
  output: string
}

export function TerminalApp() {
  const [history, setHistory] = useState<CommandHistory[]>([
    { command: "", output: "WebOS Terminal v1.0.0\n输入 'help' 查看可用命令\n" },
  ])
  const [currentInput, setCurrentInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  const processCommand = (cmd: string): string => {
    const command = cmd.trim().toLowerCase()

    switch (command) {
      case "help":
        return `可用命令:
  help     - 显示帮助信息
  clear    - 清屏
  date     - 显示当前日期时间
  whoami   - 显示当前用户
  ls       - 列出文件
  pwd      - 显示当前目录
  echo     - 输出文本
  version  - 显示版本信息`
      case "clear":
        setHistory([])
        return ""
      case "date":
        return new Date().toLocaleString("zh-CN")
      case "whoami":
        return "user@webos"
      case "ls":
        return "Documents  Downloads  Pictures  Music  Videos  Desktop"
      case "pwd":
        return "/home/user"
      case "version":
        return "WebOS Terminal v1.0.0"
      default:
        if (command.startsWith("echo ")) {
          return cmd.slice(5)
        }
        if (command === "") {
          return ""
        }
        return `命令未找到: ${command}`
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const output = processCommand(currentInput)
    if (output !== "" || currentInput.trim().toLowerCase() !== "clear") {
      setHistory((prev) => [...prev, { command: currentInput, output }])
    }
    setCurrentInput("")
  }

  return (
    <div
      className="h-full bg-black p-4 font-mono text-sm overflow-auto"
      ref={terminalRef}
      onClick={() => inputRef.current?.focus()}
    >
      {history.map((item, index) => (
        <div key={index} className="mb-2">
          {item.command && (
            <div className="flex gap-2">
              <span className="text-green-400">user@webos</span>
              <span className="text-muted-foreground">:</span>
              <span className="text-blue-400">~</span>
              <span className="text-muted-foreground">$</span>
              <span className="text-foreground">{item.command}</span>
            </div>
          )}
          {item.output && <pre className="text-foreground whitespace-pre-wrap">{item.output}</pre>}
        </div>
      ))}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <span className="text-green-400">user@webos</span>
        <span className="text-muted-foreground">:</span>
        <span className="text-blue-400">~</span>
        <span className="text-muted-foreground">$</span>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          className="flex-1 bg-transparent text-foreground outline-none"
          autoFocus
        />
      </form>
    </div>
  )
}
