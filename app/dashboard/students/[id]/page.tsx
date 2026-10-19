import { notFound } from "next/navigation"
import { requireRole } from "@/lib/auth"
import { sql } from "@/lib/db"
import { EditStudentForm } from "./edit-form"

export const instant = false

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireRole("hod", "admin")
  const { id } = await params

  const students = await sql`SELECT * FROM students WHERE id = ${id}`
  if (students.length === 0) notFound()
  
  const student = students[0] as any // using any here to bypass strict types for nullable columns

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Student</h1>
        <p className="text-muted-foreground text-sm">
          Update details for {student.first_name} {student.last_name} ({student.index_number})
        </p>
      </div>
      
      <EditStudentForm student={student} />
    </div>
  )
}