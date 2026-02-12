"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2 } from "lucide-react"

const playlist = [
  { id: 1, title: "星空下的梦想", artist: "夜空乐队", duration: 225, album: "夜曲" },
  { id: 2, title: "城市的光", artist: "电子节拍", duration: 252, album: "霓虹" },
  { id: 3, title: "海风", artist: "海岸线", duration: 208, album: "夏日" },
  { id: 4, title: "回忆的旋律", artist: "怀旧组合", duration: 301, album: "时光" },
  { id: 5, title: "未来之声", artist: "合成器大师", duration: 273, album: "2077" },
]

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(playlist[0])
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(75)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            // Go to next track
            const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id)
            if (currentIndex < playlist.length - 1) {
              setCurrentTrack(playlist[currentIndex + 1])
            } else {
              setIsPlaying(false)
            }
            return 0
          }
          return prev + 100 / currentTrack.duration
        })
      }, 1000)
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current)
    }
  }, [isPlaying, currentTrack])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const currentTime = Math.floor((progress / 100) * currentTrack.duration)

  const handlePrevious = () => {
    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id)
    if (currentIndex > 0) {
      setCurrentTrack(playlist[currentIndex - 1])
      setProgress(0)
    }
  }

  const handleNext = () => {
    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id)
    if (currentIndex < playlist.length - 1) {
      setCurrentTrack(playlist[currentIndex + 1])
      setProgress(0)
    }
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[oklch(0.18_0.02_270)] to-[oklch(0.10_0.01_250)]">
      {/* Album Art & Info */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-48 h-48 rounded-2xl bg-white/10 shadow-2xl overflow-hidden mb-6 ring-1 ring-white/10">
          <img src="/album-cover-art-abstract-colorful-gradient.jpg" alt="Album Art" className="w-full h-full object-cover" />
        </div>

        <h2 className="text-xl font-semibold text-white mb-1">{currentTrack.title}</h2>
        <p className="text-sm text-white/60 mb-1">{currentTrack.artist}</p>
        <p className="text-xs text-white/40">{currentTrack.album}</p>
      </div>

      {/* Progress Bar */}
      <div className="px-6 mb-4">
        <div
          className="relative h-1.5 bg-white/10 rounded-full cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const percent = ((e.clientX - rect.left) / rect.width) * 100
            setProgress(percent)
          }}
        >
          <div className="absolute h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
          <div
            className="absolute w-3 h-3 bg-white rounded-full -top-[3px] shadow-md"
            style={{ left: `calc(${progress}% - 6px)` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-white/50">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(currentTrack.duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mb-4">
        <button className="p-2 text-white/50 hover:text-white transition-colors">
          <Shuffle className="w-5 h-5" />
        </button>
        <button onClick={handlePrevious} className="p-2 text-white hover:text-primary transition-colors">
          <SkipBack className="w-6 h-6" />
        </button>
        <button
          className="w-14 h-14 bg-primary rounded-full flex items-center justify-center hover:bg-primary/80 transition-all active:scale-95"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? <Pause className="w-7 h-7 text-white" /> : <Play className="w-7 h-7 text-white ml-1" />}
        </button>
        <button onClick={handleNext} className="p-2 text-white hover:text-primary transition-colors">
          <SkipForward className="w-6 h-6" />
        </button>
        <button className="p-2 text-white/50 hover:text-white transition-colors">
          <Repeat className="w-5 h-5" />
        </button>
      </div>

      {/* Volume */}
      <div className="px-6 mb-4 flex items-center gap-3">
        <Volume2 className="w-4 h-4 text-white/50" />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
        />
      </div>

      {/* Playlist */}
      <div className="bg-black/30 border-t border-white/10">
        <div className="px-4 py-2 text-sm text-white/70 border-b border-white/10">播放列表</div>
        <div className="max-h-32 overflow-auto">
          {playlist.map((track) => (
            <button
              key={track.id}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors",
                currentTrack.id === track.id && "bg-white/10",
              )}
              onClick={() => {
                setCurrentTrack(track)
                setProgress(0)
              }}
            >
              <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center flex-shrink-0">
                {currentTrack.id === track.id && isPlaying ? (
                  <div className="flex gap-0.5 items-end h-3">
                    <div className="w-0.5 h-full bg-primary animate-pulse" />
                    <div className="w-0.5 h-2 bg-primary animate-pulse delay-75" />
                    <div className="w-0.5 h-3 bg-primary animate-pulse delay-150" />
                  </div>
                ) : (
                  <Play className="w-3 h-3 text-white/50" />
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className={cn("text-sm truncate", currentTrack.id === track.id ? "text-primary" : "text-white")}>
                  {track.title}
                </p>
                <p className="text-xs text-white/50 truncate">{track.artist}</p>
              </div>
              <span className="text-xs text-white/40">{formatTime(track.duration)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
