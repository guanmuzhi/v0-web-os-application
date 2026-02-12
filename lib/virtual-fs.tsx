// Virtual File System using IndexedDB for persistence
const DB_NAME = "webos-fs"
const DB_VERSION = 1
const STORE_NAME = "files"

export interface VirtualFile {
  id: string
  name: string
  type: "file" | "folder"
  parentId: string
  content?: string
  mimeType?: string
  size: number
  createdAt: number
  modifiedAt: number
}

let db: IDBDatabase | null = null

export async function initializeFS(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      db = request.result
      resolve()
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: "id" })
        store.createIndex("parentId", "parentId", { unique: false })
        store.createIndex("name", "name", { unique: false })
      }
    }
  }).then(() => seedDefaultFiles())
}

async function seedDefaultFiles(): Promise<void> {
  const existingFiles = await getFiles("home")
  if (existingFiles.length > 0) return

  const defaultFolders: Omit<VirtualFile, "createdAt" | "modifiedAt">[] = [
    { id: "home", name: "主目录", type: "folder", parentId: "root", size: 0 },
    { id: "downloads", name: "下载", type: "folder", parentId: "root", size: 0 },
    { id: "documents", name: "文档", type: "folder", parentId: "root", size: 0 },
    { id: "pictures", name: "图片", type: "folder", parentId: "root", size: 0 },
    { id: "music", name: "音乐", type: "folder", parentId: "root", size: 0 },
    { id: "videos", name: "视频", type: "folder", parentId: "root", size: 0 },
    { id: "apps", name: "应用", type: "folder", parentId: "root", size: 0 },
  ]

  const sampleFiles: Omit<VirtualFile, "id" | "createdAt" | "modifiedAt">[] = [
    {
      name: "欢迎.txt",
      type: "file",
      parentId: "documents",
      content: "欢迎使用 WebOS！\n\n这是一个基于浏览器的操作系统。",
      mimeType: "text/plain",
      size: 50,
    },
    {
      name: "示例应用.html",
      type: "file",
      parentId: "apps",
      content: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
    .container { text-align: center; padding: 2rem; }
    h1 { font-size: 2.5rem; margin-bottom: 1rem; }
    button { background: white; color: #667eea; border: none; padding: 1rem 2rem; font-size: 1rem; border-radius: 8px; cursor: pointer; margin: 0.5rem; }
    button:hover { transform: scale(1.05); }
    #counter { font-size: 4rem; margin: 2rem 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>HTML 应用示例</h1>
    <p>这是一个运行在 WebOS 中的 HTML 应用</p>
    <div id="counter">0</div>
    <button onclick="increment()">+1</button>
    <button onclick="decrement()">-1</button>
    <button onclick="reset()">重置</button>
  </div>
  <script>
    let count = 0;
    function updateDisplay() { document.getElementById('counter').textContent = count; }
    function increment() { count++; updateDisplay(); }
    function decrement() { count--; updateDisplay(); }
    function reset() { count = 0; updateDisplay(); }
  </script>
</body>
</html>`,
      mimeType: "text/html",
      size: 1200,
    },
    {
      name: "游戏.html",
      type: "file",
      parentId: "apps",
      content: `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #1a1a2e; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: monospace; }
    canvas { border: 2px solid #0f3460; border-radius: 8px; }
    .info { position: absolute; top: 20px; left: 50%; transform: translateX(-50%); color: #e94560; font-size: 20px; }
  </style>
</head>
<body>
  <div class="info">使用方向键移动 | 分数: <span id="score">0</span></div>
  <canvas id="game" width="400" height="400"></canvas>
  <script>
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const gridSize = 20;
    let snake = [{x: 10, y: 10}];
    let food = {x: 15, y: 15};
    let dx = 0, dy = 0;
    let score = 0;
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' && dy !== 1) { dx = 0; dy = -1; }
      if (e.key === 'ArrowDown' && dy !== -1) { dx = 0; dy = 1; }
      if (e.key === 'ArrowLeft' && dx !== 1) { dx = -1; dy = 0; }
      if (e.key === 'ArrowRight' && dx !== -1) { dx = 1; dy = 0; }
    });
    
    function gameLoop() {
      const head = {x: snake[0].x + dx, y: snake[0].y + dy};
      if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) { snake = [{x: 10, y: 10}]; dx = 0; dy = 0; score = 0; }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score++; document.getElementById('score').textContent = score;
        food = {x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20)};
      } else { snake.pop(); }
      
      ctx.fillStyle = '#16213e';
      ctx.fillRect(0, 0, 400, 400);
      ctx.fillStyle = '#e94560';
      ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
      ctx.fillStyle = '#0f3460';
      snake.forEach(s => ctx.fillRect(s.x * gridSize, s.y * gridSize, gridSize - 2, gridSize - 2));
    }
    setInterval(gameLoop, 150);
  </script>
</body>
</html>`,
      mimeType: "text/html",
      size: 2000,
    },
  ]

  const now = Date.now()
  for (const folder of defaultFolders) {
    await createFile({ ...folder, createdAt: now, modifiedAt: now } as VirtualFile)
  }
  for (const file of sampleFiles) {
    await createFile({
      ...file,
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      modifiedAt: now,
    } as VirtualFile)
  }
}

export async function getFiles(parentId: string): Promise<VirtualFile[]> {
  if (!db) await initializeFS()
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(STORE_NAME, "readonly")
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index("parentId")
    const request = index.getAll(parentId)
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

export async function getFile(id: string): Promise<VirtualFile | null> {
  if (!db) await initializeFS()
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(STORE_NAME, "readonly")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(id)
    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

export async function createFile(
  file: Partial<VirtualFile> & { name: string; type: "file" | "folder"; parentId: string },
): Promise<VirtualFile> {
  if (!db) await initializeFS()
  const now = Date.now()
  const newFile: VirtualFile = {
    id: file.id || `${file.type}-${now}-${Math.random().toString(36).substr(2, 9)}`,
    name: file.name,
    type: file.type,
    parentId: file.parentId,
    content: file.content,
    mimeType: file.mimeType,
    size: file.size || 0,
    createdAt: file.createdAt || now,
    modifiedAt: file.modifiedAt || now,
  }
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(STORE_NAME, "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put(newFile)
    request.onsuccess = () => resolve(newFile)
    request.onerror = () => reject(request.error)
  })
}

export async function updateFile(id: string, updates: Partial<VirtualFile>): Promise<VirtualFile | null> {
  const file = await getFile(id)
  if (!file) return null
  const updated = { ...file, ...updates, modifiedAt: Date.now() }
  return createFile(updated as VirtualFile)
}

export async function deleteFile(id: string): Promise<boolean> {
  if (!db) await initializeFS()
  // Also delete children if folder
  const children = await getFiles(id)
  for (const child of children) {
    await deleteFile(child.id)
  }
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(STORE_NAME, "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)
    request.onsuccess = () => resolve(true)
    request.onerror = () => reject(request.error)
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
