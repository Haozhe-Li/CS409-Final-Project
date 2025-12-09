import { createClient } from "@/lib/supabase/server"
import { PostCard } from "@/components/post-card"

interface FeedProps {
  userId: string
}

export async function Feed({ userId }: FeedProps) {
  const supabase = await createClient()

  const { data: posts } = await supabase
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
    .order("created_at", { ascending: false })

  if (!posts || posts.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">No posts yet. Be the first to post!</div>
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={userId} />
      ))}
    </div>
  )
}
