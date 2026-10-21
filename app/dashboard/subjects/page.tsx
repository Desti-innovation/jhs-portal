import { requireRole } from "@/lib/auth"
import { sql } from "@/lib/db"
import { AssignTeacherForm } from "./assign-form"

export const instant = false

export default async function SubjectsPage() {
  await requireRole("hod", "admin")

  // 1. Get all subjects and their assigned teachers
  const subjects = await sql`
    SELECT 
      s.id, 
      s.name, 
      s.code,
      COALESCE(
        (SELECT string_agg(u.name, ', ') 
         FROM teacher_assignments ta 
         JOIN users u ON u.id = ta.teacher_id 
         WHERE ta.subject_id = s.id), 
        'No teacher assigned'
      ) AS teachers
    FROM subjects s
    ORDER BY s.name
  ` as { id: string; name: string; code: string; teachers: string }[]

  // 2. Get all teachers so the HOD can assign them
  const teachers = await sql`
    SELECT id, name, email 
    FROM users 
    WHERE role = 'teacher' 
    ORDER BY name
  ` as { id: string; name: string; email: string }[]

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">Subjects</h1>

      <div className="space-y-4">
        {subjects.map((sub) => (
          <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-md border p-4 gap-4 bg-card">
            <div>
              <h2 className="font-semibold text-lg flex items-center gap-2">
                {sub.name}
                <span className="text-xs font-normal text-muted-foreground border px-1.5 py-0.5 rounded">
                  {sub.code}
                </span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-medium text-foreground">Teacher(s):</span> {sub.teachers}
              </p>
            </div>
            
            {/* The Assign Form Component */}
            <AssignTeacherForm subjectId={sub.id} teachers={teachers} />
          </div>
        ))}
      </div>
    </div>
  )
}