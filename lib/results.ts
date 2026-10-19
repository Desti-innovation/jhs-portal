import { sql } from "@/lib/db"
import { computeAggregate } from "@/lib/grading"

export async function getStudentResult(mockId: string, studentId: string) {
  // Add image_url to the select statement
  const studentRes = await sql`
    SELECT id, first_name, last_name, index_number, image_url
    FROM students WHERE id = ${studentId}
  `
  if (studentRes.length === 0) return null
  const student = studentRes[0] as {
    id: string
    first_name: string
    last_name: string
    index_number: string
    image_url: string | null
  }

  // Sort subjects in BECE order (Core first, then electives alphabetically)
  const scores = await sql`
    SELECT 
      sub.code,
      sub.name,
      sc.score,
      sc.grade
    FROM subjects sub
    LEFT JOIN scores sc ON sc.subject_id = sub.id AND sc.student_id = ${studentId} AND sc.mock_id = ${mockId}
    ORDER BY 
      CASE sub.code
        WHEN 'ENG' THEN 1
        WHEN 'MTH' THEN 2
        WHEN 'SCI' THEN 3
        WHEN 'SST' THEN 4
        ELSE 5
      END ASC,
      sub.name ASC
  ` as { code: string; name: string; score: number | null; grade: number | null }[]

  const aggregateData = computeAggregate(
    scores.map(s => ({ subject_code: s.code, score: s.score }))
  )

  return {
    student,
    scores,
    aggregate: aggregateData
  }
}