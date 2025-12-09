"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { MobileNav, Sidebar } from "@/components/sidebar"
import { RightSidebar } from "@/components/right-sidebar"
import { PostCard } from "@/components/post-card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [posts, setPosts] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [userId, setUserId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        setProfile(data)
      }
    }
    loadUser()
  }, [])

  // sync local state with URL ?q=
  useEffect(() => {
    const q = searchParams.get("q") || ""
    setSearchQuery((prev) => (prev !== q ? q : prev))
  }, [searchParams])

  useEffect(() => {
    const searchPosts = async () => {
      if (!searchQuery.trim()) {
        setPosts([])
        return
      }

      setIsLoading(true)
      const { data } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles:author_id (
            username,
            display_name,
            avatar_url
          ),
          likes (
            user_id
          )
        `,
        )
        .ilike("content", `%${searchQuery}%`)
        .order("created_at", { ascending: false })

      setPosts(data || [])
      setIsLoading(false)
    }

    const debounce = setTimeout(searchPosts, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  // Keep URL in sync with input in near real-time (debounced)
  useEffect(() => {
    const handler = setTimeout(() => {
      const q = searchQuery.trim()
      const currentQ = searchParams.get("q") || ""
      if (q !== currentQ) {
        router.replace(q ? `/search?q=${encodeURIComponent(q)}` : "/search", { scroll: false })
      }
    }, 250)
    return () => clearTimeout(handler)
  }, [searchQuery, searchParams, router])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    router.replace(q ? `/search?q=${encodeURIComponent(q)}` : `/search`)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar profile={profile} />
      <main className="flex-1 border-x">
        <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm p-4">
          <div className="mb-4 flex items-center gap-3">
            <MobileNav profile={profile} />
            <h1 className="text-xl font-bold">Search</h1>
          </div>
          <form onSubmit={onSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </form>
        </div>

        <div>
          {isLoading && (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="border-b p-4">
                  <div className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="mt-2">
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && searchQuery && posts.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No matching posts found</div>
          )}

          {!isLoading && !searchQuery && (
            <div className="p-8 text-center text-muted-foreground">Enter keywords to search posts</div>
          )}

          {!isLoading && posts.map((post) => <PostCard key={post.id} post={post} currentUserId={userId} />)}
        </div>
      </main>
      <RightSidebar />
    </div>
  )
}
