"use client"

import type React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import type { UserProfile } from "@/lib/webos-store"
import { createUser } from "@/lib/webos-store"
import { Plus, User, Check, X, Trash2 } from "lucide-react"

interface UserSelectScreenProps {
  users: UserProfile[]
  wallpaper: string
  pixelEffect?: boolean
  onSelectUser: (userId: string) => void
  onUsersChange: (users: UserProfile[]) => void
}

const USER_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
]

export function UserSelectScreen({
  users,
  wallpaper,
  pixelEffect,
  onSelectUser,
  onUsersChange,
}: UserSelectScreenProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newUserName, setNewUserName] = useState("")
  const [selectedColor, setSelectedColor] = useState(USER_COLORS[0])
  const [showDelete, setShowDelete] = useState<string | null>(null)

  const handleCreateUser = () => {
    if (!newUserName.trim()) return
    const newUser = createUser(newUserName.trim(), selectedColor)
    onUsersChange([...users, newUser])
    setNewUserName("")
    setSelectedColor(USER_COLORS[0])
    setIsCreating(false)
  }

  const handleDeleteUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (users.length <= 1) return
    const updatedUsers = users.filter((u) => u.id !== userId)
    onUsersChange(updatedUsers)
    setShowDelete(null)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div
      className={cn("fixed inset-0 z-[9500] flex flex-col items-center justify-center select-none", pixelEffect && "pixel-effect")}
      style={{
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xl" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-white max-w-4xl w-full px-6">
        <h1 className={cn("text-3xl md:text-4xl font-light mb-2", pixelEffect && "font-mono")}>
          选择用户
        </h1>
        <p className="text-white/60 mb-12">选择一个账户登录</p>

        {/* User Grid */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {users.map((user) => (
            <div
              key={user.id}
              className="relative group"
              onMouseEnter={() => setShowDelete(user.id)}
              onMouseLeave={() => setShowDelete(null)}
            >
              <button
                onClick={() => onSelectUser(user.id)}
                className={cn(
                  "flex flex-col items-center gap-3 p-6 rounded-2xl transition-all",
                  "hover:bg-white/10 active:scale-95",
                )}
              >
                {/* Avatar */}
                <div
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl font-semibold shadow-lg"
                  style={{ backgroundColor: user.color }}
                >
                  {user.avatar ? (
                    <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    getInitials(user.name) || <User className="w-10 h-10" />
                  )}
                </div>
                {/* Name */}
                <span className="text-lg font-medium">{user.name}</span>
              </button>

              {/* Delete button */}
              {showDelete === user.id && users.length > 1 && (
                <button
                  onClick={(e) => handleDeleteUser(user.id, e)}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all shadow-lg"
                  title="删除用户"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          {/* Add User Button */}
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-2xl transition-all",
                "hover:bg-white/10 active:scale-95",
              )}
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/10 border-2 border-dashed border-white/30 flex items-center justify-center">
                <Plus className="w-8 h-8 text-white/60" />
              </div>
              <span className="text-lg font-medium text-white/60">添加用户</span>
            </button>
          )}
        </div>

        {/* Create User Form */}
        {isCreating && (
          <div className="w-full max-w-md bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold mb-4">创建新用户</h3>

            {/* Name Input */}
            <div className="mb-4">
              <label className="block text-sm text-white/60 mb-2">用户名</label>
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="输入用户名..."
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/40 transition-colors"
                autoFocus
              />
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <label className="block text-sm text-white/60 mb-2">选择颜色</label>
              <div className="flex flex-wrap gap-2">
                {USER_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "w-10 h-10 rounded-full transition-all",
                      selectedColor === color && "ring-2 ring-white ring-offset-2 ring-offset-transparent",
                    )}
                    style={{ backgroundColor: color }}
                  >
                    {selectedColor === color && <Check className="w-5 h-5 text-white mx-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="mb-6 flex justify-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold"
                style={{ backgroundColor: selectedColor }}
              >
                {newUserName ? getInitials(newUserName) : <User className="w-6 h-6" />}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsCreating(false)
                  setNewUserName("")
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
                取消
              </button>
              <button
                onClick={handleCreateUser}
                disabled={!newUserName.trim()}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors",
                  newUserName.trim()
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-white/20 text-white/40 cursor-not-allowed",
                )}
              >
                <Check className="w-4 h-4" />
                创建
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
