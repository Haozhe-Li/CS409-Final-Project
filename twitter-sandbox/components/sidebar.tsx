"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Home, Search, User, LogOut, PanelLeftOpen, PanelLeftClose, Menu } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { TokenDialog } from "@/components/token-dialog"
import { useEffect, useState, useCallback } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface SidebarProps {
  profile: {
    username: string
    display_name: string
  } | null
}

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/profile", label: "Profile", icon: User },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return navItems.map(({ href, label, icon: Icon }) => (
    <Link key={href} href={href}>
      <Button
        variant="ghost"
        className="w-full justify-start gap-4 text-lg"
        onClick={onNavigate}
      >
        <Icon className="h-6 w-6" />
        {label}
      </Button>
    </Link>
  ))
}

function useLogout() {
  const router = useRouter()
  const supabase = createClient()

  return useCallback(async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }, [router, supabase])
}

export function Sidebar({ profile }: SidebarProps) {
  const handleLogout = useLogout()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed")
    if (saved) setCollapsed(saved === "true")
  }, [])

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c
      localStorage.setItem("sidebar_collapsed", String(next))
      return next
    })
  }

  return (
    <aside
      className={
        "sticky top-0 hidden h-screen flex-col gap-4 p-4 transition-[width] duration-200 md:flex"
      }
      style={{ width: collapsed ? "4rem" : "16rem" }}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className={`text-2xl font-bold ${collapsed ? "sr-only" : ""}`}>Twitter Sandbox</h2>
          <Button variant="ghost" size="icon" onClick={toggleCollapsed} aria-label="Toggle sidebar">
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {collapsed ? (
        <div className="flex flex-1 items-start" />
      ) : (
        <nav className="flex flex-col gap-2">
          <NavLinks />
          <TokenDialog />
        </nav>
      )}

      <div className="mt-auto">
        {profile && (
          <div className="mb-4">
            <div className="rounded-lg border p-3 transition-transform will-change-transform hover:shadow-sm hover:bg-muted/40 hover:-translate-y-[1px]">
              <p className={`font-semibold ${collapsed ? "sr-only" : ""}`}>{profile.display_name}</p>
              <p className={`text-sm text-muted-foreground ${collapsed ? "sr-only" : ""}`}>@{profile.username}</p>
            </div>
          </div>
        )}
        <Button variant="ghost" className={`w-full justify-start gap-4 text-destructive ${collapsed ? "sr-only" : ""}`} onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  )
}

export function MobileNav({ profile }: SidebarProps) {
  const handleLogout = useLogout()
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[18rem] p-0">
        <SheetHeader className="border-b p-4 text-left">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="flex h-full flex-col gap-4 p-4">
          <nav className="flex flex-col gap-2">
            <NavLinks onNavigate={close} />
            <TokenDialog />
          </nav>

          <div className="mt-auto space-y-3">
            {profile && (
              <div className="rounded-lg border p-3">
                <p className="font-semibold">{profile.display_name}</p>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
              </div>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start gap-4 text-destructive"
              onClick={async () => {
                await handleLogout()
                close()
              }}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
