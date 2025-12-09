import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Feed } from "@/components/feed"
import { MobileNav, Sidebar } from "@/components/sidebar"
import { RightSidebar } from "@/components/right-sidebar"
import { CreatePost } from "@/components/create-post"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar profile={profile} />
      <main className="flex-1 border-x">
        <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 p-4">
            <MobileNav profile={profile} />
            <h1 className="text-xl font-bold">Home</h1>
          </div>
        </div>
        <CreatePost userId={user.id} />
        <Feed userId={user.id} />
      </main>
      <RightSidebar />
    </div>
  )
}
