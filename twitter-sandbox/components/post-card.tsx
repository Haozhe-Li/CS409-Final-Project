"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface PostCardProps {
  post: {
    id: string
    content: string
    created_at: string
    author_id: string
    profiles: {
      username: string
      display_name: string
      avatar_url: string | null
    }
    likes: { user_id: string }[]
  }
  currentUserId: string
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const supabase = createClient()
  const router = useRouter()
  const [isLiking, setIsLiking] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isLiked = post.likes.some((like) => like.user_id === currentUserId)
  const likesCount = post.likes.length
  const isOwnPost = post.author_id === currentUserId

  const handleLike = async () => {
    setIsLiking(true)
    try {
      if (isLiked) {
        await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", currentUserId)
      } else {
        await supabase.from("likes").insert({
          post_id: post.id,
          user_id: currentUserId,
        })
      }
      router.refresh()
    } catch (error) {
      console.error("Error toggling like:", error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return

    setIsDeleting(true)
    try {
      const { error } = await supabase.from("posts").delete().eq("id", post.id)
      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error deleting post:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60))
      return `${minutes}m ago`
    } else if (hours < 24) {
      return `${hours}h ago`
    } else {
      const days = Math.floor(hours / 24)
      return `${days}d ago`
    }
  }

  return (
    <article className="border-b p-4 hover:bg-muted/50 transition-colors">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
          {post.profiles.display_name[0].toUpperCase()}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-semibold">{post.profiles.display_name}</span>
              <span className="ml-2 text-sm text-muted-foreground">@{post.profiles.username}</span>
              <span className="ml-2 text-sm text-muted-foreground">· {formatDate(post.created_at)}</span>
            </div>
            {isOwnPost && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <p className="mt-1 text-pretty">{post.content}</p>

          <div className="mt-3 flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleLike} disabled={isLiking} className="gap-2">
              <Heart className={cn("h-5 w-5", isLiked && "fill-red-500 text-red-500")} />
              <span className={cn(isLiked && "text-red-500")}>{likesCount}</span>
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
