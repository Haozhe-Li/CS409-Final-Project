"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface CreatePostProps {
  userId: string
}

export function CreatePost({ userId }: CreatePostProps) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsLoading(true)
    try {
      const { error } = await supabase.from("posts").insert({
        author_id: userId,
        content: content.trim(),
      })

      if (error) throw error

      setContent("")
      router.refresh()
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-b p-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's happening?"
        className="min-h-24 resize-none border-0 text-lg focus-visible:ring-0"
        maxLength={280}
      />
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{content.length}/280</span>
        <Button type="submit" disabled={isLoading || !content.trim()}>
          {isLoading ? "Posting..." : "Post"}
        </Button>
      </div>
    </form>
  )
}
