"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { KeyRound } from "lucide-react"

export function TokenDialog() {
    const supabase = createClient()
    const [open, setOpen] = React.useState(false)
    const [token, setToken] = React.useState("")
    const [status, setStatus] = React.useState("")
    const [loading, setLoading] = React.useState(false)

    const loadToken = React.useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase.auth.getSession()
        if (error) {
            setStatus(`Failed to get token: ${error.message}`)
            setToken("")
        } else {
            const t = data.session?.access_token ?? ""
            setToken(t)
            setStatus(t ? "JWT available" : "Unauthenticated or no token available")
        }
        setLoading(false)
    }, [supabase])

    React.useEffect(() => {
        if (open) void loadToken()
    }, [open, loadToken])

    const copy = async () => {
        if (!token) return
        try {
            await navigator.clipboard.writeText(token)
            setStatus("JWT copied to clipboard")
        } catch (e: any) {
            setStatus(`Copy failed: ${e?.message ?? String(e)}`)
        }
    }

    const refresh = async () => {
        await loadToken()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-4 text-lg">
                    <KeyRound className="h-6 w-6" />
                    Token
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>My Access Token (JWT)</DialogTitle>
                    <DialogDescription>
                        Used for request header: Authorization: Bearer &lt;JWT&gt;. Token is short-lived; refresh after expiration.
                    </DialogDescription>
                </DialogHeader>

                <Textarea value={token} readOnly rows={4} className="w-full" />
                <DialogFooter>
                    <div className="flex gap-2 ml-auto">
                        <Button onClick={copy} disabled={!token || loading}>Copy JWT</Button>
                        <Button variant="secondary" onClick={refresh} disabled={loading}>Refresh</Button>
                    </div>
                </DialogFooter>
                {status && <p className="text-sm text-muted-foreground">{status}</p>}
            </DialogContent>
        </Dialog>
    )
}
