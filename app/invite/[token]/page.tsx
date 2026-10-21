import { notFound } from "next/navigation"
import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { InviteSignupForm } from "./signup-form"

export const instant = false

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  // Check if invite exists, is not used, and hasn't expired
  const invites = await sql`
    SELECT id, role, used, expires_at 
    FROM invites 
    WHERE token = ${token}
  ` as { id: string, role: string, used: boolean, expires_at: string }[]

  const invite = invites[0]

  if (!invite || invite.used || new Date(invite.expires_at) < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-red-500">Invalid or Expired Link</CardTitle>
            <CardDescription>
              This invite link has already been used or has expired. Please contact the HOD for a new link.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>
            You have been invited to join as a <strong className="capitalize">{invite.role}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteSignupForm token={token} role={invite.role} />
        </CardContent>
      </Card>
    </div>
  )
}