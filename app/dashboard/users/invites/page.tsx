import { requireRole } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { InviteGenerator } from "./invite-generator"

export const instant = false

export default async function InvitesPage() {
  await requireRole("hod", "admin")

  // Get past invites to show their status
  const invites = await sql`
    SELECT token, role, expires_at, used 
    FROM invites 
    ORDER BY created_at DESC 
    LIMIT 10
  ` as { token: string, role: string, expires_at: string, used: boolean }[]

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Staff Invite Links</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Generate one-time links to let staff members create their own accounts.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Generator Component */}
        <InviteGenerator />

        {/* Recent Links */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Invites</CardTitle>
            <CardDescription>Latest generated invite links.</CardDescription>
          </CardHeader>
          <CardContent>
            {invites.length === 0 ? (
              <p className="text-sm text-muted-foreground">No invites generated yet.</p>
            ) : (
              <div className="space-y-3">
                {invites.map((inv) => (
                  <div key={inv.token} className="text-sm flex items-center justify-between p-2 rounded bg-muted/50 border">
                    <div>
                      <span className="font-medium capitalize">{inv.role}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(inv.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      {inv.used ? (
                        <span className="text-xs text-red-500 font-medium">Used</span>
                      ) : (
                        <span className="text-xs text-emerald-500 font-medium">Active</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}