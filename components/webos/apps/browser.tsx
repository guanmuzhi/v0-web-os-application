"use client"

import { useState, useRef } from "react"
import { ArrowLeft, ArrowRight, RotateCw, Home, Star, Search, X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface Tab {
  id: string
  url: string
  title: string
}

export function Browser() {
  const [tabs, setTabs] = useState<Tab[]>([{ id: "1", url: "https://www.bing.com", title: "Bing" }])
  const [activeTabId, setActiveTabId] = useState("1")
  const [inputUrl, setInputUrl] = useState("https://www.bing.com")
  const [history, setHistory] = useState<string[]>(["https://www.bing.com"])
  const [historyIndex, setHistoryIndex] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const activeTab = tabs.find((t) => t.id === activeTabId)

  const navigate = (url: string) => {
    let finalUrl = url
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      if (url.includes(".") && !url.includes(" ")) {
        finalUrl = `https://${url}`
      } else {
        finalUrl = `https://www.bing.com/search?q=${encodeURIComponent(url)}`
      }
    }

    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, url: finalUrl, title: new URL(finalUrl).hostname } : t)),
    )
    setInputUrl(finalUrl)
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), finalUrl])
    setHistoryIndex((prev) => prev + 1)
  }

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      const url = history[newIndex]
      setTabs((prev) => prev.map((t) => (t.id === activeTabId ? { ...t, url, title: new URL(url).hostname } : t)))
      setInputUrl(url)
    }
  }

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      const url = history[newIndex]
      setTabs((prev) => prev.map((t) => (t.id === activeTabId ? { ...t, url, title: new URL(url).hostname } : t)))
      setInputUrl(url)
    }
  }

  const reload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = activeTab?.url || ""
    }
  }

  const addTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      url: "https://www.bing.com",
      title: "New Tab",
    }
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(newTab.id)
    setInputUrl(newTab.url)
  }

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return
    const newTabs = tabs.filter((t) => t.id !== tabId)
    setTabs(newTabs)
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[newTabs.length - 1].id)
      setInputUrl(newTabs[newTabs.length - 1].url)
    }
  }

  const quickLinks = [
    { name: "Google", url: "https://www.google.com", color: "bg-red-500" },
    { name: "GitHub", url: "https://www.github.com", color: "bg-gray-700" },
    { name: "YouTube", url: "https://www.youtube.com", color: "bg-red-600" },
    { name: "Twitter", url: "https://www.twitter.com", color: "bg-blue-400" },
    { name: "Wikipedia", url: "https://www.wikipedia.org", color: "bg-gray-600" },
    { name: "Reddit", url: "https://www.reddit.com", color: "bg-orange-500" },
  ]

  return (
    <div className="h-full flex flex-col bg-[oklch(0.12_0.01_250)]">
      {/* Tab Bar */}
      <div className="h-9 bg-black/30 flex items-center px-2 gap-1">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => {
              setActiveTabId(tab.id)
              setInputUrl(tab.url)
            }}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-t-lg cursor-pointer min-w-[120px] max-w-[200px] group",
              activeTabId === tab.id ? "bg-[oklch(0.16_0.01_250)]" : "bg-transparent hover:bg-white/5",
            )}
          >
            <span className="text-xs text-white truncate flex-1">{tab.title}</span>
            {tabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(tab.id)
                }}
                className="w-4 h-4 flex items-center justify-center rounded hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white/70" />
              </button>
            )}
          </div>
        ))}
        <button onClick={addTab} className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10">
          <Plus className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="h-11 bg-[oklch(0.16_0.01_250)] border-b border-white/10 flex items-center gap-2 px-3">
        <button
          onClick={goBack}
          disabled={historyIndex === 0}
          className="p-2 rounded hover:bg-white/10 transition-colors disabled:opacity-30"
        >
          <ArrowLeft className="w-4 h-4 text-white/70" />
        </button>
        <button
          onClick={goForward}
          disabled={historyIndex >= history.length - 1}
          className="p-2 rounded hover:bg-white/10 transition-colors disabled:opacity-30"
        >
          <ArrowRight className="w-4 h-4 text-white/70" />
        </button>
        <button onClick={reload} className="p-2 rounded hover:bg-white/10 transition-colors">
          <RotateCw className="w-4 h-4 text-white/70" />
        </button>
        <button
          onClick={() => navigate("https://www.bing.com")}
          className="p-2 rounded hover:bg-white/10 transition-colors"
        >
          <Home className="w-4 h-4 text-white/70" />
        </button>

        {/* URL Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            navigate(inputUrl)
          }}
          className="flex-1 flex items-center gap-2 bg-black/30 rounded-lg px-3 py-1.5"
        >
          <Search className="w-4 h-4 text-white/50" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
            placeholder="输入网址或搜索..."
          />
        </form>

        <button className="p-2 rounded hover:bg-white/10 transition-colors">
          <Star className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {/* Browser Content */}
      <div className="flex-1 relative bg-white">
        {activeTab?.url.includes("bing.com") && !activeTab.url.includes("search") ? (
          // Home page
          <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[oklch(0.16_0.01_250)] to-[oklch(0.12_0.01_250)]">
            <div className="text-center max-w-lg">
              <h1 className="text-3xl font-bold text-white mb-8">WebOS Browser</h1>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  navigate(inputUrl)
                }}
                className="flex gap-2 mb-8"
              >
                <input
                  type="text"
                  placeholder="搜索或输入网址"
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/40"
                  onChange={(e) => setInputUrl(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                >
                  搜索
                </button>
              </form>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                {quickLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => navigate(link.url)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold",
                        link.color,
                      )}
                    >
                      {link.name[0]}
                    </div>
                    <span className="text-xs text-white/80">{link.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={activeTab?.url}
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
            title="Browser Content"
          />
        )}
      </div>
    </div>
  )
}
