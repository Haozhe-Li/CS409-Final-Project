"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"

type Profile = {
    id: string
    username: string | null
    display_name: string | null
    bio?: string | null
}

export function EditProfileDialog({ profile }: { profile: Profile | null }) {
    const [open, setOpen] = React.useState(false)
    const [username, setUsername] = React.useState(profile?.username ?? "")
    const [displayName, setDisplayName] = React.useState(profile?.display_name ?? "")
    const [bio, setBio] = React.useState(profile?.bio ?? "")
    const [saving, setSaving] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    React.useEffect(() => {
        setUsername(profile?.username ?? "")
        setDisplayName(profile?.display_name ?? "")
        setBio(profile?.bio ?? "")
    }, [profile, open])

    const onSave = async () => {
        if (!profile?.id) return
        setSaving(true)
        setError(null)
        const payload = {
            username: username.trim(),
            display_name: displayName.trim(),
            bio: bio.trim(),
        }
        const { error } = await supabase.from("profiles").update(payload).eq("id", profile.id)
        if (error) {
            setError(error.message)
        } else {
            setOpen(false)
            router.refresh()
        }
        setSaving(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Button variant="outline" onClick={() => setOpen(true)}>Edit profile</Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Display name</label>
                        <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Username</label>
                        <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Bio</label>
                        <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Tell something about you" />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <DialogFooter>
                    <div className="flex gap-2 ml-auto">
                        <Button variant="secondary" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
                        <Button onClick={onSave} disabled={saving || !displayName.trim() || !username.trim()}>Save</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
