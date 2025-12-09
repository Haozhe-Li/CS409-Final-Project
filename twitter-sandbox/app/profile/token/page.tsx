"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

export default function TokenPage() {
    const supabase = createClient();
    const [token, setToken] = useState<string>("");
    const [status, setStatus] = useState<string>("");

    useEffect(() => {
        let mounted = true;
        supabase.auth.getSession().then(({ data, error }) => {
            if (!mounted) return;
            if (error) {
                setStatus(`Failed to get token${error.message}`);
                return;
            }
            const t = data.session?.access_token ?? "";
            setToken(t);
            setStatus(t ? "JWT available" : "Unauthenticated or no token available");
        });
        return () => {
            mounted = false;
        };
    }, [supabase]);

    const copy = async () => {
        if (!token) return;
        try {
            await navigator.clipboard.writeText(token);
            setStatus("JWT copied to clipboard");
        } catch (e: any) {
            setStatus(`Copy failed: ${e?.message ?? String(e)}`);
        }
    };

    const refresh = async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            setStatus(`Refresh failed: ${error.message}`);
            return;
        }
        const t = data.session?.access_token ?? "";
        setToken(t);
        setStatus(t ? "Refreshed short-lived JWT" : "Unauthenticated or no token available");
    };

    return (
        <div className="max-w-xl mx-auto p-6 space-y-4">
            <h1 className="text-xl font-semibold">My Access Token (JWT)</h1>
            <p className="text-sm text-muted-foreground">
                Used for Langflow request header: Authorization: Bearer &lt;JWT&gt;. The token is short-lived and should be refreshed after expiration.
            </p>
            <Textarea value={token} readOnly rows={4} className="w-full" />
            <div className="flex gap-2">
                <Button onClick={copy} disabled={!token}>
                    Copy JWT
                </Button>
                <Button variant="secondary" onClick={refresh}>
                    Refresh
                </Button>
            </div>
            {status && <p className="text-sm text-muted-foreground">{status}</p>}
        </div>
    );
}
