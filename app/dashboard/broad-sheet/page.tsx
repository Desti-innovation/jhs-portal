import { requireRole } from "@/lib/auth"
import { sql } from "@/lib/db"
import { listMocks } from "@/lib/mocks"
import { BroadSheetUI } from "./broad-sheet-ui"

export const instant = false

export default async function BroadSheetPage({
  searchParams,
}: {
  searchParams: Promise<{ mock?: string }>
}) {
  await requireRole("hod", "admin", "headmaster")
  const { mock: mockId } = await searchParams

  const allMocks = await listMocks()
  const publishedMocks = allMocks.filter(m => m.status === "published")
  const selectedMock = mockId 
    ? publishedMocks.find(m => m.id === mockId) 
    : publishedMocks[0]

  if (!selectedMock) {
    return <div className="p-6 text-center text-muted-foreground">No published mocks available.</div>
  }

  // 1. Get Subjects
  const subjects = await sql`
    SELECT id, name, code FROM subjects ORDER BY name
  ` as { id: string, name: string, code: string }[]

  // 2. Get Students
  const students = await sql`
    SELECT id, index_number, first_name, last_name FROM students ORDER BY index_number
  ` as { id: string, index_number: string, first_name: string, last_name: string }[]

  // 3. Get Scores AND Grades
  const scores = await sql`
    SELECT student_id, subject_id, score, grade 
    FROM scores 
    WHERE mock_id = ${selectedMock.id}
  ` as { student_id: string, subject_id: string, score: string, grade: string }[]

  return (
    <div className="p-4 md:p-6 bg-muted/10 min-h-screen">
      <BroadSheetUI 
        mock={selectedMock}
        publishedMocks={publishedMocks}
        subjects={subjects}
        students={students}
        scores={scores}
      />
    </div>
  )
}