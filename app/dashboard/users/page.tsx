import Link from "next/link"
import { requireRole } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserPlusIcon, ShieldCheckIcon, ShieldAlertIcon } from "lucide-react"

export const instant = false

export default async function UsersPage() {
  // Only HOD and Admin can view this page
  await requireRole("hod", "admin")

  const users = await sql`
    SELECT id, name, email, role, is_active, created_at
    FROM users
    WHERE role IN ('hod', 'teacher', 'admin')
    ORDER BY role, name
  ` as { id: string; name: string; email: string; role: string; is_active: boolean; created_at: string }[]

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage HODs, Teachers, and Admins.</p>
        </div>
        <Button nativeButton={false} render={<Link href="/dashboard/users/new" />}>
          <UserPlusIcon className="mr-2 h-4 w-4" /> Add Staff
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left border-b">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-muted/10">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="capitalize">
                    {u.role}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {u.is_active ? (
                    <span className="flex items-center text-xs font-medium text-emerald-600">
                      <ShieldCheckIcon className="mr-1 h-4 w-4" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center text-xs font-medium text-destructive">
                      <ShieldAlertIcon className="mr-1 h-4 w-4" /> Inactive
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}