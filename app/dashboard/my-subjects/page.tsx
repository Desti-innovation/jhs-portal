import { requireRole } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpenIcon } from "lucide-react"

export const instant = false

export default async function MySubjectsPage() {
  const user = await requireRole("teacher")

  const subjects = await sql`
    SELECT 
      s.id, 
      s.name, 
      s.code
    FROM subjects s
    JOIN teacher_assignments ta ON ta.subject_id = s.id
    WHERE ta.teacher_id = ${user.id}
    ORDER BY s.name ASC
  ` as { id: string, name: string, code: string }[]

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Subjects</h1>
        <p className="text-muted-foreground text-sm mt-1">
          These are the subjects you are assigned to grade for JHS 3.
        </p>
      </div>

      {subjects.length === 0 ? (
        <div className="rounded-md border p-10 text-center text-muted-foreground bg-muted/10">
          You have not been assigned any subjects yet. Please contact the HOD.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {subjects.map((sub) => (
            <Card key={sub.id} className="bg-muted/10 shadow-none">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <BookOpenIcon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">{sub.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{sub.code}</p>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}