"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import {
  Play,
  Square,
  RefreshCw,
  Code,
  Eye,
  Save,
  FolderOpen,
  FileCode,
  Copy,
  Download,
  Maximize2,
  Minimize2,
  SplitSquareHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface HtmlRunnerProps {
  windowProps?: {
    htmlContent?: string
    fileName?: string
  }
}

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的 HTML 应用</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .container {
      text-align: center;
      max-width: 600px;
    }
    
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      background: linear-gradient(90deg, #00d9ff, #00ff88);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    p {
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    
    .button {
      background: linear-gradient(90deg, #00d9ff, #00ff88);
      border: none;
      padding: 12px 32px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      color: #1a1a2e;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(0, 217, 255, 0.3);
    }
    
    .counter {
      margin-top: 2rem;
      font-size: 3rem;
      font-weight: bold;
    }
    
    .info {
      margin-top: 2rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>欢迎使用 HTML 运行器</h1>
    <p>
      在左侧编辑器中编写 HTML、CSS 和 JavaScript 代码，<br>
      点击"运行"按钮即可在右侧预览效果。
    </p>
    
    <button class="button" onclick="incrementCounter()">
      点击计数
    </button>
    
    <div class="counter" id="counter">0</div>
    
    <div class="info">
      <p>支持的功能：</p>
      <ul style="text-align: left; margin-top: 0.5rem; padding-left: 1.5rem;">
        <li>完整的 HTML5 支持</li>
        <li>内联 CSS 样式</li>
        <li>JavaScript 交互</li>
        <li>Canvas 绑定</li>
        <li>本地存储 API</li>
      </ul>
    </div>
  </div>
  
  <script>
    let count = 0;
    
    function incrementCounter() {
      count++;
      document.getElementById('counter').textContent = count;
    }
    
    // 控制台输出
    console.log('HTML 应用已加载！');
  </script>
</body>
</html>`

const EXAMPLE_TEMPLATES = [
  {
    name: "计数器应用",
    code: DEFAULT_HTML,
  },
  {
    name: "画布动画",
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; overflow: hidden; background: #000; }
    canvas { display: block; }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 100;
    
    class Particle {
      constructor() {
        this.reset();
      }
      
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.radius = Math.random() * 3 + 1;
        this.color = \`hsl(\${Math.random() * 360}, 70%, 60%)\`;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    
    function animate() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      
      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = \`rgba(255, 255, 255, \${1 - dist / 100})\`;
            ctx.stroke();
          }
        });
      });
      
      requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  </script>
</body>
</html>`,
  },
  {
    name: "待办事项",
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container {
      max-width: 500px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 { font-size: 1.5rem; }
    .input-area {
      display: flex;
      padding: 20px;
      gap: 10px;
    }
    input {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid #eee;
      border-radius: 8px;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus { border-color: #667eea; }
    button {
      padding: 12px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }
    .todo-list {
      padding: 0 20px 20px;
    }
    .todo-item {
      display: flex;
      align-items: center;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 10px;
      gap: 12px;
    }
    .todo-item.done { opacity: 0.5; }
    .todo-item.done span { text-decoration: line-through; }
    .checkbox {
      width: 24px;
      height: 24px;
      border: 2px solid #667eea;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .checkbox.checked {
      background: #667eea;
      color: white;
    }
    .delete {
      margin-left: auto;
      color: #ff6b6b;
      cursor: pointer;
      padding: 4px 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>待办事项</h1>
    </div>
    <div class="input-area">
      <input type="text" id="input" placeholder="添加新任务..." onkeypress="if(event.key==='Enter')addTodo()">
      <button onclick="addTodo()">添加</button>
    </div>
    <div class="todo-list" id="list"></div>
  </div>
  <script>
    let todos = JSON.parse(localStorage.getItem('todos') || '[]');
    
    function render() {
      const list = document.getElementById('list');
      list.innerHTML = todos.map((todo, i) => \`
        <div class="todo-item \${todo.done ? 'done' : ''}">
          <div class="checkbox \${todo.done ? 'checked' : ''}" onclick="toggle(\${i})">
            \${todo.done ? '✓' : ''}
          </div>
          <span>\${todo.text}</span>
          <span class="delete" onclick="remove(\${i})">✕</span>
        </div>
      \`).join('');
    }
    
    function addTodo() {
      const input = document.getElementById('input');
      if (input.value.trim()) {
        todos.push({ text: input.value.trim(), done: false });
        input.value = '';
        save();
      }
    }
    
    function toggle(i) {
      todos[i].done = !todos[i].done;
      save();
    }
    
    function remove(i) {
      todos.splice(i, 1);
      save();
    }
    
    function save() {
      localStorage.setItem('todos', JSON.stringify(todos));
      render();
    }
    
    render();
  </script>
</body>
</html>`,
  },
  {
    name: "时钟",
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #1a1a2e;
      font-family: 'Courier New', monospace;
    }
    .clock {
      text-align: center;
    }
    .time {
      font-size: 6rem;
      color: #00ff88;
      text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
      letter-spacing: 0.1em;
    }
    .date {
      font-size: 1.5rem;
      color: rgba(255, 255, 255, 0.6);
      margin-top: 1rem;
    }
    .analog {
      width: 300px;
      height: 300px;
      border: 4px solid #00ff88;
      border-radius: 50%;
      position: relative;
      margin: 40px auto;
      box-shadow: 0 0 30px rgba(0, 255, 136, 0.3);
    }
    .hand {
      position: absolute;
      bottom: 50%;
      left: 50%;
      transform-origin: bottom center;
      background: #00ff88;
      border-radius: 4px;
    }
    .hour { width: 6px; height: 80px; margin-left: -3px; }
    .minute { width: 4px; height: 100px; margin-left: -2px; }
    .second { width: 2px; height: 120px; margin-left: -1px; background: #ff6b6b; }
    .center {
      width: 16px;
      height: 16px;
      background: #00ff88;
      border-radius: 50%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .marks {
      position: absolute;
      inset: 10px;
    }
    .mark {
      position: absolute;
      width: 2px;
      height: 10px;
      background: rgba(0, 255, 136, 0.5);
      left: 50%;
      transform-origin: center 130px;
    }
    .mark.hour-mark { height: 20px; width: 4px; background: #00ff88; }
  </style>
</head>
<body>
  <div class="clock">
    <div class="time" id="time"></div>
    <div class="date" id="date"></div>
    <div class="analog">
      <div class="marks" id="marks"></div>
      <div class="hand hour" id="hour"></div>
      <div class="hand minute" id="minute"></div>
      <div class="hand second" id="second"></div>
      <div class="center"></div>
    </div>
  </div>
  <script>
    // Create marks
    const marks = document.getElementById('marks');
    for (let i = 0; i < 60; i++) {
      const mark = document.createElement('div');
      mark.className = 'mark' + (i % 5 === 0 ? ' hour-mark' : '');
      mark.style.transform = \`translateX(-50%) rotate(\${i * 6}deg)\`;
      marks.appendChild(mark);
    }
    
    function update() {
      const now = new Date();
      
      // Digital
      document.getElementById('time').textContent = now.toLocaleTimeString('zh-CN', { hour12: false });
      document.getElementById('date').textContent = now.toLocaleDateString('zh-CN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Analog
      const h = now.getHours() % 12;
      const m = now.getMinutes();
      const s = now.getSeconds();
      
      document.getElementById('hour').style.transform = \`rotate(\${h * 30 + m * 0.5}deg)\`;
      document.getElementById('minute').style.transform = \`rotate(\${m * 6}deg)\`;
      document.getElementById('second').style.transform = \`rotate(\${s * 6}deg)\`;
    }
    
    update();
    setInterval(update, 1000);
  </script>
</body>
</html>`,
  },
]

export function HtmlRunner({ windowProps }: HtmlRunnerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [code, setCode] = useState(windowProps?.htmlContent || DEFAULT_HTML)
  const [isRunning, setIsRunning] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"split" | "code" | "preview">("split")
  const [showTemplates, setShowTemplates] = useState(false)
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])
  const [fileName, setFileName] = useState(windowProps?.fileName || "untitled.html")

  const runCode = useCallback(() => {
    if (iframeRef.current) {
      try {
        // Inject console capture
        const wrappedCode = code.replace(
          "</body>",
          `<script>
            (function() {
              const originalLog = console.log;
              const originalError = console.error;
              console.log = function(...args) {
                window.parent.postMessage({ type: 'console', level: 'log', args: args.map(a => String(a)) }, '*');
                originalLog.apply(console, args);
              };
              console.error = function(...args) {
                window.parent.postMessage({ type: 'console', level: 'error', args: args.map(a => String(a)) }, '*');
                originalError.apply(console, args);
              };
              window.onerror = function(msg, url, line) {
                window.parent.postMessage({ type: 'console', level: 'error', args: ['Error: ' + msg + ' (line ' + line + ')'] }, '*');
              };
            })();
          </script></body>`
        )

        const blob = new Blob([wrappedCode], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        iframeRef.current.src = url
        setError(null)
        setIsRunning(true)

        return () => URL.revokeObjectURL(url)
      } catch (e) {
        setError("无法加载应用")
      }
    }
  }, [code])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "console") {
        const { level, args } = event.data
        const message = `[${level.toUpperCase()}] ${args.join(" ")}`
        setConsoleOutput((prev) => [...prev.slice(-50), message])
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  useEffect(() => {
    if (isRunning) {
      runCode()
    }
  }, [isRunning, runCode])

  const handleStop = () => {
    setIsRunning(false)
    if (iframeRef.current) {
      iframeRef.current.src = "about:blank"
    }
  }

  const handleRestart = () => {
    setConsoleOutput([])
    runCode()
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
  }

  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  const loadTemplate = (template: typeof EXAMPLE_TEMPLATES[0]) => {
    setCode(template.code)
    setFileName(`${template.name}.html`)
    setShowTemplates(false)
    setConsoleOutput([])
  }

  return (
    <div className="h-full flex flex-col bg-[oklch(0.12_0.01_250)]">
      {/* Toolbar */}
      <div className="h-12 bg-black/30 border-b border-white/10 flex items-center gap-2 px-3">
        {/* File name */}
        <div className="flex items-center gap-2 flex-1">
          <FileCode className="w-4 h-4 text-white/60" />
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="bg-transparent text-sm text-white/80 outline-none border-b border-transparent focus:border-white/30 w-32"
          />
        </div>

        {/* View Mode */}
        <div className="flex items-center bg-white/10 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("code")}
            className={cn(
              "p-1.5 rounded transition-colors",
              viewMode === "code" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
            )}
            title="代码视图"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("split")}
            className={cn(
              "p-1.5 rounded transition-colors",
              viewMode === "split" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
            )}
            title="分屏视图"
          >
            <SplitSquareHorizontal className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("preview")}
            className={cn(
              "p-1.5 rounded transition-colors",
              viewMode === "preview" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
            )}
            title="预览视图"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-white/10" />

        {/* Templates */}
        <div className="relative">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="p-2 rounded hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            title="模板"
          >
            <FolderOpen className="w-4 h-4" />
          </button>

          {showTemplates && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowTemplates(false)} />
              <div className="absolute top-full right-0 mt-1 w-48 bg-[oklch(0.15_0.01_250)] border border-white/10 rounded-lg shadow-xl z-20 py-1">
                <div className="px-3 py-2 text-xs text-white/50 border-b border-white/10">示例模板</div>
                {EXAMPLE_TEMPLATES.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => loadTemplate(template)}
                    className="w-full px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10 transition-colors"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <button onClick={copyCode} className="p-2 rounded hover:bg-white/10 transition-colors" title="复制代码">
          <Copy className="w-4 h-4 text-white/70" />
        </button>
        <button onClick={downloadCode} className="p-2 rounded hover:bg-white/10 transition-colors" title="下载">
          <Download className="w-4 h-4 text-white/70" />
        </button>

        {/* Separator */}
        <div className="w-px h-6 bg-white/10" />

        {/* Run Controls */}
        {isRunning ? (
          <button onClick={handleStop} className="p-2 rounded hover:bg-white/10 transition-colors" title="停止">
            <Square className="w-4 h-4 text-red-400" />
          </button>
        ) : (
          <button onClick={() => setIsRunning(true)} className="p-2 rounded hover:bg-white/10 transition-colors" title="运行">
            <Play className="w-4 h-4 text-green-400" />
          </button>
        )}
        <button onClick={handleRestart} className="p-2 rounded hover:bg-white/10 transition-colors" title="重新运行">
          <RefreshCw className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor */}
        {(viewMode === "code" || viewMode === "split") && (
          <div className={cn("flex flex-col", viewMode === "split" ? "w-1/2 border-r border-white/10" : "w-full")}>
            <div className="flex-1 relative">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="absolute inset-0 w-full h-full bg-[oklch(0.08_0.01_250)] text-white/90 font-mono text-sm p-4 resize-none outline-none leading-relaxed"
                placeholder="在这里编写 HTML 代码..."
                spellCheck={false}
              />
            </div>

            {/* Console */}
            <div className="h-32 border-t border-white/10 bg-black/30 flex flex-col">
              <div className="px-3 py-1 text-xs text-white/50 border-b border-white/10 flex items-center justify-between">
                <span>控制台</span>
                <button onClick={() => setConsoleOutput([])} className="hover:text-white/80 transition-colors">
                  清空
                </button>
              </div>
              <div className="flex-1 overflow-auto p-2 font-mono text-xs">
                {consoleOutput.length === 0 ? (
                  <p className="text-white/30">控制台输出将显示在这里...</p>
                ) : (
                  consoleOutput.map((line, i) => (
                    <div
                      key={i}
                      className={cn(
                        "py-0.5",
                        line.startsWith("[ERROR]") ? "text-red-400" : "text-white/70"
                      )}
                    >
                      {line}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div className={cn("flex-1 relative", viewMode === "split" ? "" : "w-full")}>
            {error ? (
              <div className="h-full flex items-center justify-center text-red-400">{error}</div>
            ) : (
              <iframe
                ref={iframeRef}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-scripts allow-forms allow-modals allow-same-origin"
                title="HTML App Preview"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
