import { requireRole } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Badge } from "@/components/ui/badge"

export const instant = false

export default async function UsersPage() {
  await requireRole("hod", "admin")

  const users = await sql`
    SELECT id, name, email, role, created_at
    FROM users
    WHERE role IN ('teacher', 'parent', 'admin')
    ORDER BY role, name
  ` as { id: string; name: string; email: string; role: string; created_at: string }[]

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-6">Users</h1>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left border-b">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
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