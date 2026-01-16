"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, List } from "lucide-react"

const playlist = [
  { id: 1, title: "星空下的梦想", artist: "夜空乐队", duration: "3:45", album: "夜曲" },
  { id: 2, title: "城市的光", artist: "电子节拍", duration: "4:12", album: "霓虹" },
  { id: 3, title: "海风", artist: "海岸线", duration: "3:28", album: "夏日" },
  { id: 4, title: "回忆的旋律", artist: "怀旧组合", duration: "5:01", album: "时光" },
  { id: 5, title: "未来之声", artist: "合成器大师", duration: "4:33", album: "2077" },
]

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(playlist[0])
  const [progress, setProgress] = useState(35)

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-card to-background">
      {/* Album Art & Info */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-48 h-48 rounded-2xl bg-secondary/50 shadow-2xl overflow-hidden mb-6">
          <img
            src={`/placeholder.svg?height=192&width=192&query=album cover art abstract colorful`}
            alt="Album Art"
            className="w-full h-full object-cover"
          />
        </div>

        <h2 className="text-xl font-semibold text-foreground mb-1">{currentTrack.title}</h2>
        <p className="text-sm text-muted-foreground mb-1">{currentTrack.artist}</p>
        <p className="text-xs text-muted-foreground">{currentTrack.album}</p>
      </div>

      {/* Progress Bar */}
      <div className="px-6 mb-4">
        <div className="relative h-1 bg-secondary rounded-full">
          <div className="absolute h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>1:18</span>
          <span>{currentTrack.duration}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Shuffle className="w-5 h-5" />
        </button>
        <button className="p-2 text-foreground hover:text-primary transition-colors">
          <SkipBack className="w-6 h-6" />
        </button>
        <button
          className="w-14 h-14 bg-primary rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <Pause className="w-7 h-7 text-primary-foreground" />
          ) : (
            <Play className="w-7 h-7 text-primary-foreground ml-1" />
          )}
        </button>
        <button className="p-2 text-foreground hover:text-primary transition-colors">
          <SkipForward className="w-6 h-6" />
        </button>
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Repeat className="w-5 h-5" />
        </button>
      </div>

      {/* Playlist */}
      <div className="bg-secondary/30 border-t border-border">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <span className="text-sm text-foreground">播放列表</span>
          <List className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="max-h-32 overflow-auto">
          {playlist.map((track) => (
            <button
              key={track.id}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2 hover:bg-secondary/50 transition-colors",
                currentTrack.id === track.id && "bg-primary/10",
              )}
              onClick={() => setCurrentTrack(track)}
            >
              <div className="w-8 h-8 rounded bg-secondary/50 flex items-center justify-center">
                {currentTrack.id === track.id && isPlaying ? (
                  <div className="flex gap-0.5">
                    <div className="w-0.5 h-3 bg-primary animate-pulse" />
                    <div className="w-0.5 h-3 bg-primary animate-pulse delay-75" />
                    <div className="w-0.5 h-3 bg-primary animate-pulse delay-150" />
                  </div>
                ) : (
                  <Play className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className={cn("text-sm", currentTrack.id === track.id ? "text-primary" : "text-foreground")}>
                  {track.title}
                </p>
                <p className="text-xs text-muted-foreground">{track.artist}</p>
              </div>
              <span className="text-xs text-muted-foreground">{track.duration}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
