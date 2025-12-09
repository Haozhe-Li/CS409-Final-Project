import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MobileNav, Sidebar } from "@/components/sidebar"
import { RightSidebar } from "@/components/right-sidebar"
import { PostCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { EditProfileDialog } from "@/components/edit-profile-dialog"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

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
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })

  const postsCount = posts?.length || 0

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar profile={profile} />
      <main className="flex-1 border-x">
        <div className="border-b">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <MobileNav profile={profile} />
              <h1 className="text-xl font-bold">Profile</h1>
            </div>
          </div>

          <div className="relative">
            <div className="h-48 bg-gradient-to-r from-primary/20 to-primary/10" />
            <div className="absolute -bottom-16 left-4">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-background bg-primary text-4xl font-bold text-primary-foreground">
                {profile?.display_name[0].toUpperCase()}
              </div>
            </div>
          </div>

          <div className="mt-20 px-4 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{profile?.display_name}</h2>
                <p className="text-muted-foreground">@{profile?.username}</p>
              </div>
              <EditProfileDialog profile={profile}
              />
            </div>

            {profile?.bio && <p className="mt-3 text-pretty">{profile.bio}</p>}

            <div className="mt-4 flex gap-4 text-sm">
              <span>
                <strong>{postsCount}</strong> <span className="text-muted-foreground">Posts</span>
              </span>
            </div>
          </div>
        </div>

        <div>
          {posts && posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} currentUserId={user.id} />)
          ) : (
            <div className="p-8 text-center text-muted-foreground">You haven't posted anything yet</div>
          )}
        </div>
      </main>
      <RightSidebar />
    </div>
  )
}
