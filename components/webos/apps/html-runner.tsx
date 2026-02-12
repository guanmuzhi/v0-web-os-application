"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { Play, Square, RefreshCw, Code, Eye, Save, FolderOpen, FileCode, Copy, Download, SplitSquareHorizontal, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { fileCreate, fileList, fileRead, fileWrite, clipboardCopy, type VirtualFile } from "@/lib/webos-api"

interface HtmlRunnerProps {
  windowProps?: { htmlContent?: string; fileName?: string }
}

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的 HTML 应用</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
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
    .container { text-align: center; max-width: 600px; }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      background: linear-gradient(90deg, #00d9ff, #00ff88);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p { color: rgba(255,255,255,0.7); margin-bottom: 2rem; line-height: 1.6; }
    .button {
      background: linear-gradient(90deg, #00d9ff, #00ff88);
      border: none; padding: 12px 32px; border-radius: 8px;
      font-size: 1rem; font-weight: 600; color: #1a1a2e;
      cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
    }
    .button:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,217,255,0.3); }
    .counter { margin-top: 2rem; font-size: 3rem; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <h1>欢迎使用 HTML 运行器</h1>
    <p>在左侧编辑器中编写 HTML、CSS 和 JavaScript 代码，<br>点击"运行"按钮即可在右侧预览效果。</p>
    <button class="button" onclick="incrementCounter()">点击计数</button>
    <div class="counter" id="counter">0</div>
  </div>
  <script>
    let count = 0;
    function incrementCounter() {
      count++;
      document.getElementById('counter').textContent = count;
    }
    console.log('HTML 应用已加载！');
  </script>
</body>
</html>`

const EXAMPLE_TEMPLATES = [
  { name: "计数器应用", code: DEFAULT_HTML },
  {
    name: "画布动画",
    code: `<!DOCTYPE html>
<html><head><style>body{margin:0;overflow:hidden;background:#000}canvas{display:block}</style></head>
<body><canvas id="c"></canvas>
<script>
const c=document.getElementById('c'),x=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;
const ps=Array.from({length:100},()=>({x:Math.random()*c.width,y:Math.random()*c.height,vx:(Math.random()-.5)*2,vy:(Math.random()-.5)*2,r:Math.random()*3+1,color:\`hsl(\${Math.random()*360},70%,60%)\`}));
function draw(){x.fillStyle='rgba(0,0,0,0.05)';x.fillRect(0,0,c.width,c.height);
ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>c.width)p.vx*=-1;if(p.y<0||p.y>c.height)p.vy*=-1;
x.beginPath();x.arc(p.x,p.y,p.r,0,Math.PI*2);x.fillStyle=p.color;x.fill()});
ps.forEach((a,i)=>ps.slice(i+1).forEach(b=>{const d=Math.hypot(a.x-b.x,a.y-b.y);if(d<100){x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.strokeStyle=\`rgba(255,255,255,\${1-d/100})\`;x.stroke()}}));
requestAnimationFrame(draw)}draw();
onresize=()=>{c.width=innerWidth;c.height=innerHeight}
</script></body></html>`
  },
  {
    name: "待办事项",
    code: `<!DOCTYPE html>
<html><head><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui;background:linear-gradient(135deg,#667eea,#764ba2);min-height:100vh;padding:40px 20px}
.c{max-width:500px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.3);overflow:hidden}
.h{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:30px;text-align:center}
.i{display:flex;padding:20px;gap:10px}input{flex:1;padding:12px 16px;border:2px solid #eee;border-radius:8px;font-size:1rem;outline:none}input:focus{border-color:#667eea}
button{padding:12px 24px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600}
.l{padding:0 20px 20px}.t{display:flex;align-items:center;padding:12px;background:#f8f9fa;border-radius:8px;margin-bottom:10px;gap:12px}
.t.d{opacity:.5}.t.d span{text-decoration:line-through}.cb{width:24px;height:24px;border:2px solid #667eea;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center}
.cb.ch{background:#667eea;color:#fff}.del{margin-left:auto;color:#ff6b6b;cursor:pointer;padding:4px 8px}
</style></head><body><div class="c"><div class="h"><h1>待办事项</h1></div>
<div class="i"><input id="inp" placeholder="添加新任务..." onkeypress="if(event.key==='Enter')add()"><button onclick="add()">添加</button></div>
<div class="l" id="list"></div></div>
<script>
let todos=JSON.parse(localStorage.getItem('todos')||'[]');
function render(){document.getElementById('list').innerHTML=todos.map((t,i)=>\`<div class="t \${t.done?'d':''}"><div class="cb \${t.done?'ch':''}" onclick="toggle(\${i})">\${t.done?'✓':''}</div><span>\${t.text}</span><span class="del" onclick="rm(\${i})">✕</span></div>\`).join('')}
function add(){const i=document.getElementById('inp');if(i.value.trim()){todos.push({text:i.value.trim(),done:false});i.value='';save()}}
function toggle(i){todos[i].done=!todos[i].done;save()}
function rm(i){todos.splice(i,1);save()}
function save(){localStorage.setItem('todos',JSON.stringify(todos));render()}
render()
</script></body></html>`
  },
  {
    name: "时钟",
    code: `<!DOCTYPE html>
<html><head><style>
body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#1a1a2e;font-family:'Courier New',monospace}
.time{font-size:6rem;color:#00ff88;text-shadow:0 0 20px rgba(0,255,136,.5);text-align:center}
.date{font-size:1.5rem;color:rgba(255,255,255,.6);margin-top:1rem;text-align:center}
</style></head><body><div><div class="time" id="t"></div><div class="date" id="d"></div></div>
<script>
setInterval(()=>{const n=new Date;document.getElementById('t').textContent=n.toLocaleTimeString('zh-CN',{hour12:false});document.getElementById('d').textContent=n.toLocaleDateString('zh-CN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})},1000)
</script></body></html>`
  },
]

export function HtmlRunner({ windowProps }: HtmlRunnerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [code, setCode] = useState(windowProps?.htmlContent || DEFAULT_HTML)
  const [isRunning, setIsRunning] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"split" | "code" | "preview">("split")
  const [showTemplates, setShowTemplates] = useState(false)
  const [showOpenDialog, setShowOpenDialog] = useState(false)
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])
  const [fileName, setFileName] = useState(windowProps?.fileName || "untitled.html")
  const [htmlFiles, setHtmlFiles] = useState<VirtualFile[]>([])

  const runCode = useCallback(() => {
    if (!iframeRef.current) return
    try {
      const wrappedCode = code.replace("</body>",
        `<script>(function(){const ol=console.log;const oe=console.error;console.log=function(...a){window.parent.postMessage({type:'console',level:'log',args:a.map(String)},'*');ol.apply(console,a)};console.error=function(...a){window.parent.postMessage({type:'console',level:'error',args:a.map(String)},'*');oe.apply(console,a)};window.onerror=function(m,u,l){window.parent.postMessage({type:'console',level:'error',args:['Error: '+m+' (line '+l+')']},'*')}})()<\/script></body>`)
      const blob = new Blob([wrappedCode], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      iframeRef.current.src = url
      setError(null)
      setIsRunning(true)
      return () => URL.revokeObjectURL(url)
    } catch { setError("无法加载应用") }
  }, [code])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "console") {
        const { level, args } = event.data
        setConsoleOutput((prev) => [...prev.slice(-50), `[${level.toUpperCase()}] ${args.join(" ")}`])
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  useEffect(() => { if (isRunning) runCode() }, [isRunning, runCode])

  const handleStop = () => { setIsRunning(false); if (iframeRef.current) iframeRef.current.src = "about:blank" }
  const handleRestart = () => { setConsoleOutput([]); runCode() }

  const handleSave = async () => {
    await fileCreate({ name: fileName, type: "file", parentId: "apps", content: code, mimeType: "text/html", size: new Blob([code]).size })
  }

  const handleOpen = async () => {
    const apps = await fileList("apps")
    const home = await fileList("home")
    const all = [...apps, ...home].filter((f) => f.type === "file" && f.mimeType === "text/html")
    setHtmlFiles(all)
    setShowOpenDialog(true)
  }

  const handleOpenFile = async (file: VirtualFile) => {
    const content = await fileRead(file.id)
    setCode(content)
    setFileName(file.name)
    setConsoleOutput([])
    setShowOpenDialog(false)
  }

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setCode(reader.result as string)
      setFileName(file.name)
      setConsoleOutput([])
    }
    reader.readAsText(file)
  }

  const handleCopyCode = () => { clipboardCopy(code) }

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = fileName; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full flex flex-col bg-[oklch(0.12_0.01_250)]">
      {/* Toolbar */}
      <div className="h-12 bg-black/30 border-b border-white/10 flex items-center gap-2 px-3">
        <div className="flex items-center gap-2 flex-1">
          <FileCode className="w-4 h-4 text-white/60" />
          <input type="text" value={fileName} onChange={(e) => setFileName(e.target.value)} className="bg-transparent text-sm text-white/80 outline-none border-b border-transparent focus:border-white/30 w-32" />
        </div>

        {/* View Mode */}
        <div className="flex items-center bg-white/10 rounded-lg p-0.5">
          {([["code", <Code key="c" className="w-4 h-4" />, "代码视图"], ["split", <SplitSquareHorizontal key="s" className="w-4 h-4" />, "分屏视图"], ["preview", <Eye key="p" className="w-4 h-4" />, "预览视图"]] as const).map(([mode, icon, title]) => (
            <button key={mode} onClick={() => setViewMode(mode)} className={cn("p-1.5 rounded transition-colors", viewMode === mode ? "bg-white/20 text-white" : "text-white/60 hover:text-white")} title={title}>{icon}</button>
          ))}
        </div>

        <div className="w-px h-6 bg-white/10" />

        {/* Templates */}
        <div className="relative">
          <button onClick={() => setShowTemplates(!showTemplates)} className="p-2 rounded hover:bg-white/10 transition-colors text-white/70 hover:text-white" title="模板"><FolderOpen className="w-4 h-4" /></button>
          {showTemplates && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowTemplates(false)} />
              <div className="absolute top-full right-0 mt-1 w-48 bg-[oklch(0.15_0.01_250)] border border-white/10 rounded-lg shadow-xl z-20 py-1">
                <div className="px-3 py-2 text-xs text-white/50 border-b border-white/10">示例模板</div>
                {EXAMPLE_TEMPLATES.map((t, i) => (
                  <button key={i} onClick={() => { setCode(t.code); setFileName(`${t.name}.html`); setShowTemplates(false); setConsoleOutput([]) }} className="w-full px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10 transition-colors">{t.name}</button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Open & Upload */}
        <button onClick={handleOpen} className="p-2 rounded hover:bg-white/10 transition-colors" title="从文件系统打开"><FolderOpen className="w-4 h-4 text-white/70" /></button>
        <label className="p-2 rounded hover:bg-white/10 transition-colors cursor-pointer" title="从本机上传">
          <Upload className="w-4 h-4 text-white/70" />
          <input type="file" accept=".html,.htm" className="hidden" onChange={handleUploadFile} />
        </label>

        <div className="w-px h-6 bg-white/10" />
        <button onClick={handleSave} className="p-2 rounded hover:bg-white/10 transition-colors" title="保存到文件系统"><Save className="w-4 h-4 text-white/70" /></button>
        <button onClick={handleCopyCode} className="p-2 rounded hover:bg-white/10 transition-colors" title="复制代码"><Copy className="w-4 h-4 text-white/70" /></button>
        <button onClick={handleDownload} className="p-2 rounded hover:bg-white/10 transition-colors" title="下载"><Download className="w-4 h-4 text-white/70" /></button>

        <div className="w-px h-6 bg-white/10" />
        {isRunning
          ? <button onClick={handleStop} className="p-2 rounded hover:bg-white/10 transition-colors" title="停止"><Square className="w-4 h-4 text-red-400" /></button>
          : <button onClick={() => setIsRunning(true)} className="p-2 rounded hover:bg-white/10 transition-colors" title="运行"><Play className="w-4 h-4 text-green-400" /></button>}
        <button onClick={handleRestart} className="p-2 rounded hover:bg-white/10 transition-colors" title="重新运行"><RefreshCw className="w-4 h-4 text-white/70" /></button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {(viewMode === "code" || viewMode === "split") && (
          <div className={cn("flex flex-col", viewMode === "split" ? "w-1/2 border-r border-white/10" : "w-full")}>
            <div className="flex-1 relative">
              <textarea value={code} onChange={(e) => setCode(e.target.value)} className="absolute inset-0 w-full h-full bg-[oklch(0.08_0.01_250)] text-white/90 font-mono text-sm p-4 resize-none outline-none leading-relaxed" placeholder="在这里编写 HTML 代码..." spellCheck={false} />
            </div>
            <div className="h-32 border-t border-white/10 bg-black/30 flex flex-col">
              <div className="px-3 py-1 text-xs text-white/50 border-b border-white/10 flex items-center justify-between">
                <span>控制台 ({consoleOutput.length})</span>
                <button onClick={() => setConsoleOutput([])} className="hover:text-white/80 transition-colors">清空</button>
              </div>
              <div className="flex-1 overflow-auto p-2 font-mono text-xs">
                {consoleOutput.length === 0 ? (
                  <p className="text-white/30">控制台输出将显示在这里...</p>
                ) : consoleOutput.map((line, i) => (
                  <div key={i} className={cn("py-0.5", line.startsWith("[ERROR]") ? "text-red-400" : "text-white/70")}>{line}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(viewMode === "preview" || viewMode === "split") && (
          <div className={cn("flex-1 relative", viewMode === "split" ? "" : "w-full")}>
            {error ? (
              <div className="h-full flex items-center justify-center text-red-400">{error}</div>
            ) : (
              <iframe ref={iframeRef} className="w-full h-full border-0 bg-white" sandbox="allow-scripts allow-forms allow-modals allow-same-origin" title="HTML App Preview" />
            )}
          </div>
        )}
      </div>

      {/* Open File Dialog */}
      {showOpenDialog && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowOpenDialog(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="w-80 max-h-80 bg-[oklch(0.15_0.01_250)] rounded-xl border border-white/10 overflow-hidden pointer-events-auto">
              <div className="px-4 py-3 border-b border-white/10"><h3 className="text-sm font-medium text-white">打开 HTML 文件</h3></div>
              <div className="max-h-60 overflow-auto p-2">
                {htmlFiles.length === 0 ? (
                  <p className="text-sm text-white/40 text-center py-8">没有 HTML 文件</p>
                ) : htmlFiles.map((f) => (
                  <button key={f.id} onClick={() => handleOpenFile(f)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10 transition-colors">
                    <Code className="w-4 h-4 text-cyan-400" />{f.name}
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
