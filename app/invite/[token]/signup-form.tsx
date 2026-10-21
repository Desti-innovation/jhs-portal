"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { acceptInviteAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function InviteSignupForm({ token, role }: { token: string, role: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await acceptInviteAction(token, role, formData)

    if (result?.error) {
      setError(result.error)
      setPending(false)
    } else {
      router.push("/login")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" placeholder="e.g. Mr. Kwame Mensah" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" name="email" type="email" placeholder="name@destora.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Create Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>

      {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  )
}