// Virtual File System using IndexedDB for persistence
export interface FileNode {
  id: string
  name: string
  type: "file" | "folder"
  content?: string
  mimeType?: string
  size?: number
  parentId: string | null
  createdAt: number
  modifiedAt: number
  icon?: string
}

const DB_NAME = "webos-filesystem"
const DB_VERSION = 1
const STORE_NAME = "files"

class VirtualFileSystem {
  private db: IDBDatabase | null = null
  private initialized = false
  private initPromise: Promise<void> | null = null

  async init(): Promise<void> {
    if (this.initialized) return
    if (this.initPromise) return this.initPromise

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)

      request.onsuccess = () => {
        this.db = request.result
        this.initialized = true
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" })
          store.createIndex("parentId", "parentId", { unique: false })
          store.createIndex("name", "name", { unique: false })
        }
      }
    })

    await this.initPromise
    await this.seedDefaultFiles()
  }

  private async seedDefaultFiles(): Promise<void> {
    const root = await this.getFile("root")
    if (root) return

    const defaultFiles: FileNode[] = [
      {
        id: "root",
        name: "根目录",
        type: "folder",
        parentId: null,
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      },
      {
        id: "desktop",
        name: "桌面",
        type: "folder",
        parentId: "root",
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      },
      {
        id: "documents",
        name: "文档",
        type: "folder",
        parentId: "root",
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      },
      {
        id: "pictures",
        name: "图片",
        type: "folder",
        parentId: "root",
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      },
      {
        id: "music",
        name: "音乐",
        type: "folder",
        parentId: "root",
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      },
      {
        id: "videos",
        name: "视频",
        type: "folder",
        parentId: "root",
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      },
      {
        id: "downloads",
        name: "下载",
        type: "folder",
        parentId: "root",
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      },
      {
        id: "apps",
        name: "应用程序",
        type: "folder",
        parentId: "root",
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      },
      {
        id: "welcome-doc",
        name: "欢迎.txt",
        type: "file",
        content:
          "欢迎使用 WebOS！\n\n这是一个基于 Web 技术构建的操作系统界面。\n\n功能特性：\n- 虚拟文件系统（支持离线缓存）\n- 可运行 HTML 应用程序\n- 多窗口管理\n- 自定义壁纸\n\n祝您使用愉快！",
        mimeType: "text/plain",
        parentId: "documents",
        createdAt: Date.now(),
        modifiedAt: Date.now(),
        size: 150,
      },
      {
        id: "sample-html-app",
        name: "示例应用.html",
        type: "file",
        content: `<!DOCTYPE html>
<html>
<head>
  <title>示例 HTML 应用</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      box-sizing: border-box;
    }
    h1 { margin-bottom: 20px; }
    button {
      padding: 12px 24px;
      font-size: 16px;
      border: none;
      border-radius: 8px;
      background: white;
      color: #667eea;
      cursor: pointer;
      transition: transform 0.2s;
    }
    button:hover { transform: scale(1.05); }
    #counter { font-size: 48px; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>HTML 应用示例</h1>
  <p>这是一个在 WebOS 中运行的 HTML 应用</p>
  <div id="counter">0</div>
  <button onclick="count++; document.getElementById('counter').textContent = count;">点击计数</button>
  <script>let count = 0;</script>
</body>
</html>`,
        mimeType: "text/html",
        parentId: "apps",
        createdAt: Date.now(),
        modifiedAt: Date.now(),
        size: 800,
      },
      {
        id: "game-app",
        name: "贪吃蛇.html",
        type: "file",
        content: `<!DOCTYPE html>
<html>
<head>
  <title>贪吃蛇</title>
  <style>
    body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: #1a1a2e; font-family: system-ui; }
    canvas { border: 2px solid #4a9eff; border-radius: 8px; }
    .score { color: #4a9eff; font-size: 24px; margin-bottom: 10px; }
    .info { color: #888; font-size: 14px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="score">分数: <span id="score">0</span></div>
  <canvas id="game" width="400" height="400"></canvas>
  <div class="info">使用方向键或 WASD 控制</div>
  <script>
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const gridSize = 20;
    let snake = [{x: 10, y: 10}];
    let food = {x: 15, y: 15};
    let dx = 0, dy = 0;
    let score = 0;
    
    document.addEventListener('keydown', e => {
      if ((e.key === 'ArrowUp' || e.key === 'w') && dy !== 1) { dx = 0; dy = -1; }
      if ((e.key === 'ArrowDown' || e.key === 's') && dy !== -1) { dx = 0; dy = 1; }
      if ((e.key === 'ArrowLeft' || e.key === 'a') && dx !== 1) { dx = -1; dy = 0; }
      if ((e.key === 'ArrowRight' || e.key === 'd') && dx !== -1) { dx = 1; dy = 0; }
    });
    
    function gameLoop() {
      if (dx !== 0 || dy !== 0) {
        const head = {x: snake[0].x + dx, y: snake[0].y + dy};
        if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || snake.some(s => s.x === head.x && s.y === head.y)) {
          snake = [{x: 10, y: 10}]; dx = 0; dy = 0; score = 0;
        } else {
          snake.unshift(head);
          if (head.x === food.x && head.y === food.y) {
            score++; document.getElementById('score').textContent = score;
            food = {x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20)};
          } else { snake.pop(); }
        }
      }
      ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0, 0, 400, 400);
      ctx.fillStyle = '#ff6b6b'; ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
      snake.forEach((s, i) => { ctx.fillStyle = i === 0 ? '#4a9eff' : '#3d8bd4'; ctx.fillRect(s.x * gridSize, s.y * gridSize, gridSize - 2, gridSize - 2); });
    }
    setInterval(gameLoop, 100);
  </script>
</body>
</html>`,
        mimeType: "text/html",
        parentId: "apps",
        createdAt: Date.now(),
        modifiedAt: Date.now(),
        size: 2000,
      },
    ]

    for (const file of defaultFiles) {
      await this.saveFile(file)
    }
  }

  private getStore(mode: IDBTransactionMode): IDBObjectStore {
    if (!this.db) throw new Error("Database not initialized")
    const transaction = this.db.transaction(STORE_NAME, mode)
    return transaction.objectStore(STORE_NAME)
  }

  async getFile(id: string): Promise<FileNode | null> {
    await this.init()
    return new Promise((resolve, reject) => {
      const request = this.getStore("readonly").get(id)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  async getChildren(parentId: string): Promise<FileNode[]> {
    await this.init()
    return new Promise((resolve, reject) => {
      const store = this.getStore("readonly")
      const index = store.index("parentId")
      const request = index.getAll(parentId)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || [])
    })
  }

  async saveFile(file: FileNode): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      const request = this.getStore("readwrite").put(file)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async deleteFile(id: string): Promise<void> {
    await this.init()
    const children = await this.getChildren(id)
    for (const child of children) {
      await this.deleteFile(child.id)
    }
    return new Promise((resolve, reject) => {
      const request = this.getStore("readwrite").delete(id)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async createFile(
    name: string,
    parentId: string,
    type: "file" | "folder",
    content?: string,
    mimeType?: string,
  ): Promise<FileNode> {
    const file: FileNode = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      content,
      mimeType,
      parentId,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      size: content?.length || 0,
    }
    await this.saveFile(file)
    return file
  }

  async getAllFiles(): Promise<FileNode[]> {
    await this.init()
    return new Promise((resolve, reject) => {
      const request = this.getStore("readonly").getAll()
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || [])
    })
  }
}

export const fileSystem = new VirtualFileSystem()
