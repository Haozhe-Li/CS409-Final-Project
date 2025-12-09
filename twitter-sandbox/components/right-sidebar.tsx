"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type Trend = { id: string; content: string; likes: { user_id: string }[] }

export function RightSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [query, setQuery] = React.useState("")
  const [trends, setTrends] = React.useState<Trend[]>([])
  const [loadingTrends, setLoadingTrends] = React.useState(false)

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  React.useEffect(() => {
    let mounted = true
    const loadTrends = async () => {
      setLoadingTrends(true)
      const { data } = await supabase
        .from("posts")
        .select(
          `
          id,
          content,
          likes ( user_id )
        `,
        )
        .limit(100)

      if (!mounted) return
      const items = (data ?? []) as Trend[]
      const top3 = items
        .sort((a, b) => (b.likes?.length ?? 0) - (a.likes?.length ?? 0))
        .slice(0, 3)
      setTrends(top3)
      setLoadingTrends(false)
    }
    loadTrends()
    return () => {
      mounted = false
    }
  }, [])

  const isSearchPage = pathname?.startsWith("/search")

  const toQuery = (text: string) => text.trim()
  const preview = (text: string) =>
    text.length > 80 ? text.slice(0, 77).trimEnd() + "…" : text

  return (
    <aside className="sticky top-0 hidden h-screen w-80 flex-col gap-4 p-4 lg:flex">
      {!isSearchPage && (
        <div className="rounded-lg border p-4">
          <h2 className="mb-4 text-xl font-bold">Search</h2>
          <form onSubmit={onSubmitSearch}>
            <input
              type="text"
              placeholder="Search Twitter Sandbox"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setQuery("")
              }}
              className="w-full rounded-full border bg-muted px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </form>
        </div>
      )}

      <div className="rounded-lg border p-4">
        <h2 className="mb-4 text-xl font-bold">Trending</h2>
        <div className="space-y-3">
          {loadingTrends && (
            <div className="text-sm text-muted-foreground">Loading…</div>
          )}
          {!loadingTrends && trends.length === 0 && (
            <div className="text-sm text-muted-foreground">No trends yet</div>
          )}
          {!loadingTrends &&
            trends.map((post) => {
              const q = toQuery(post.content)
              return (
                <button
                  key={post.id}
                  className="w-full text-left cursor-pointer hover:bg-muted/50 rounded p-2"
                  onClick={() => router.push(`/search?q=${encodeURIComponent(q)}`)}
                >
                  <p className="text-sm text-muted-foreground">Trending now</p>
                  <p className="font-semibold">{preview(post.content)}</p>
                  <p className="text-sm text-muted-foreground">{post.likes?.length ?? 0} likes</p>
                </button>
              )
            })}
        </div>
      </div>
    </aside>
  )
}
