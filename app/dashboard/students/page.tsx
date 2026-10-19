import Link from "next/link"
import { requireRole } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { PencilIcon } from "lucide-react"

export const instant = false

export default async function StudentsPage() {
  await requireRole("hod", "admin")
  const students = await sql`SELECT * FROM students ORDER BY created_at DESC`

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Students</h1>
        <Button nativeButton={false} render={<Link href="/dashboard/students/new" />}>
          + Add Student
        </Button>
      </div>
      
      <div className="border rounded-md divide-y">
        {students.map((s: any) => (
          <div key={s.id} className="p-4 flex justify-between items-center hover:bg-muted/10">
            <div className="flex items-center gap-4">
              {s.image_url ? (
                <img src={s.image_url} className="h-10 w-10 rounded-full object-cover border" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {s.first_name[0]}{s.last_name[0]}
                </div>
              )}
              <div>
                <p className="font-medium">{s.first_name} {s.last_name}</p>
                <p className="text-sm text-muted-foreground">{s.index_number}</p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              nativeButton={false}
              render={<Link href={`/dashboard/students/${s.id}`} />}
            >
              <PencilIcon className="h-4 w-4 mr-2" /> Edit
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}