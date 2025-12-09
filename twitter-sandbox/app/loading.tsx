import { Spinner } from '@/components/ui/spinner'

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/60 backdrop-blur-sm">
            <Spinner className="size-6 text-muted-foreground" />
        </div>
    )
}
