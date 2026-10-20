"use client"

import { useState } from "react"
import Link from "next/link"
import { createStaffAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeftIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function NewStaffPage() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // We will track the role value manually in state
  const [role, setRole] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    // Manually inject the role into the FormData
    formData.set("role", role)

    const result = await createStaffAction(null, formData)
    
    if (result?.error) {
      setError(result.error)
      setPending(false)
    }
    // If successful, the server action will redirect natively
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/dashboard/users" />}>
        <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Staff
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add New Staff Member</CardTitle>
          <CardDescription>
            They will use this email and password to log in to the portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              <Label htmlFor="role">Role</Label>
              {/* Using native <select> styled by Tailwind for guaranteed form submission */}
              <select 
                id="role" 
                name="role" 
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-background [&>option]:text-foreground"
              >
                <option value="" disabled>Select a role...</option>
                <option value="teacher">Teacher</option>
                <option value="hod">HOD</option>
                <option value="admin">Admin</option>
                <option value="headmaster">Headmaster</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password</Label>
              <Input id="password" name="password" type="text" placeholder="e.g. Destora2026!" required />
              <p className="text-xs text-muted-foreground mt-1">Save this and give it to the staff member.</p>
            </div>

            {error && (
              <p className="text-sm text-red-500 font-medium">{error}</p>
            )}

            <Button type="submit" className="w-full mt-2" disabled={pending}>
              {pending ? "Creating..." : "Create Staff Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}