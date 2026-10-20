import { sql } from "@/lib/db"
import { gradeFor } from "@/lib/grading"

export type ScoreRow = {
  id: string
  mock_id: string
  student_id: string
  subject_id: string
  subject_code: string
  subject_name: string
  score: number | null
  grade: number | null
  entered_by: string
  entered_at: string
  updated_at: string
}

export type StudentRow = {
  id: string
  index_number: string
  first_name: string
  last_name: string
}

export type SubjectRow = {
  id: string
  code: string
  name: string
}

/** All JHS3 students. */
export async function listStudents(): Promise<StudentRow[]> {
  return (await sql`
    SELECT id, index_number, first_name, last_name
    FROM students
    ORDER BY index_number
  `) as StudentRow[]
}

/**
 * Subjects a user can enter scores for.
 * HOD / admin → all subjects.
 * Teacher → only their teacher_assignments.
 * Parent / headmaster → none.
 */
export async function listSubjectsForUser(
  userId: string,
  role: "hod" | "admin" | "teacher" | "parent" | "headmaster"
): Promise<SubjectRow[]> {
  if (role === "hod" || role === "admin") {
    return (await sql`
      SELECT id, code, name FROM subjects ORDER BY name
    `) as SubjectRow[]
  }
  
  if (role === "teacher") {
    return (await sql`
      SELECT s.id, s.code, s.name
      FROM subjects s
      JOIN teacher_assignments ta ON ta.subject_id = s.id
      WHERE ta.teacher_id = ${userId}
      ORDER BY s.name
    `) as SubjectRow[]
  }
  
  // Parent and headmaster get no subjects (read-only roles)
  return []
}

/** Existing scores for a mock, keyed by student_id + subject_id for fast lookup. */
export async function scoresForMock(
  mockId: string
): Promise<Record<string, { score: number | null; grade: number | null }>> {
  const rows = (await sql`
    SELECT student_id, subject_id, score, grade
    FROM scores
    WHERE mock_id = ${mockId}
  `) as {
    student_id: string
    subject_id: string
    score: string | null
    grade: number | null
  }[]

  const map: Record<string, { score: number | null; grade: number | null }> = {}
  for (const r of rows) {
    map[`${r.student_id}:${r.subject_id}`] = {
      score: r.score == null ? null : Number(r.score),
      grade: r.grade,
    }
  }
  return map
}

/** Upsert one score. Computes grade server-side via gradeFor. */
export async function upsertScore(input: {
  mock_id: string
  student_id: string
  subject_id: string
  score: number | null
  entered_by: string
}) {
  // Empty input → delete any existing score (allows clearing)
  if (input.score == null) {
    await sql`
      DELETE FROM scores
      WHERE mock_id = ${input.mock_id}
        AND student_id = ${input.student_id}
        AND subject_id = ${input.subject_id}
    `
    return
  }

  const { grade } = gradeFor(input.score)

  await sql`
    INSERT INTO scores (mock_id, student_id, subject_id, score, grade, entered_by)
    VALUES (
      ${input.mock_id},
      ${input.student_id},
      ${input.subject_id},
      ${input.score},
      ${grade},
      ${input.entered_by}
    )
    ON CONFLICT (mock_id, student_id, subject_id) DO UPDATE
      SET score = EXCLUDED.score,
          grade = EXCLUDED.grade,
          entered_by = EXCLUDED.entered_by,
          updated_at = now()
  `
}