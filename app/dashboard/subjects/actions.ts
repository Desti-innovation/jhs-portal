"use server"

import { requireRole } from "@/lib/auth"
import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function assignTeacherAction(subjectId: string, teacherId: string) {
  await requireRole("hod", "admin")

  try {
    await sql`
      INSERT INTO teacher_assignments (teacher_id, subject_id)
      VALUES (${teacherId}, ${subjectId})
      ON CONFLICT (teacher_id, subject_id) DO NOTHING
    `
  } catch (error) {
    console.error("Failed to assign teacher", error)
  }

  revalidatePath("/dashboard/subjects")
}