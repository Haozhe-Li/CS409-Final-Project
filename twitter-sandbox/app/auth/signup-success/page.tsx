import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignupSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Sign up successful!</h1>
          <p className="text-muted-foreground">Please check your email to confirm your account</p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-left">
          <p className="text-sm text-muted-foreground">
            We've sent a confirmation email to your inbox. Please click the link in the email to activate your account.
          </p>
        </div>
        <Button>
          <Link href="/auth/login">Back to login</Link>
        </Button>
      </div>
    </div>
  )
}
