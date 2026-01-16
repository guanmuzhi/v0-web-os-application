"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight, RotateCw, Home, Star, Search } from "lucide-react"

export function Browser() {
  const [url, setUrl] = useState("https://www.example.com")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Browser Toolbar */}
      <div className="h-12 bg-secondary/30 border-b border-border flex items-center gap-2 px-3">
        <button className="p-2 rounded hover:bg-secondary/50 transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <button className="p-2 rounded hover:bg-secondary/50 transition-colors">
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </button>
        <button className="p-2 rounded hover:bg-secondary/50 transition-colors">
          <RotateCw className="w-4 h-4 text-muted-foreground" />
        </button>
        <button className="p-2 rounded hover:bg-secondary/50 transition-colors">
          <Home className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="flex-1 flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-1.5">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground outline-none"
            placeholder="输入网址或搜索..."
          />
        </div>

        <button className="p-2 rounded hover:bg-secondary/50 transition-colors">
          <Star className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Browser Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Search className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">WebOS 浏览器</h2>
          <p className="text-muted-foreground mb-6">探索网络世界</p>

          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-secondary/50 rounded-lg px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary"
              placeholder="搜索或输入网址"
            />
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              搜索
            </button>
          </div>

          <div className="mt-8 grid grid-cols-4 gap-4">
            {["Google", "GitHub", "YouTube", "Twitter"].map((site) => (
              <button key={site} className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-primary/20" />
                <span className="text-xs text-muted-foreground">{site}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
