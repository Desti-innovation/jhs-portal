import Link from "next/link"
import { requireRole } from "@/lib/auth"
import { listMocks } from "@/lib/mocks"
import { sql } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { FileTextIcon } from "lucide-react"
import { computeAggregate } from "@/lib/grading"

export const instant = false

export default async function AdminResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ mock?: string }>
}) {
  await requireRole("admin", "hod", "headmaster")
  const { mock: mockId } = await searchParams

  const allMocks = await listMocks()
  const publishedMocks = allMocks.filter(m => m.status === "published")
  const selectedMock = mockId 
    ? publishedMocks.find(m => m.id === mockId) 
    : publishedMocks[0]

  if (!selectedMock) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No published mocks available. Publish a mock to view results.
      </div>
    )
  }

  // 1. Fetch all scores for this mock
  const rawScores = await sql`
    SELECT 
      s.id as student_id,
      s.first_name, 
      s.last_name, 
      s.index_number,
      sub.code as subject_code,
      sc.score
    FROM students s
    LEFT JOIN scores sc ON sc.student_id = s.id AND sc.mock_id = ${selectedMock.id}
    LEFT JOIN subjects sub ON sub.id = sc.subject_id
  ` as { 
    student_id: string, 
    first_name: string, 
    last_name: string, 
    index_number: string, 
    subject_code: string | null, 
    score: string | null 
  }[]

  // 2. Group scores by student
  const studentMap = new Map<string, { 
    id: string, 
    first_name: string, 
    last_name: string, 
    index_number: string, 
    scores: { subject_code: string, score: number | null }[] 
  }>()

  rawScores.forEach(row => {
    if (!studentMap.has(row.student_id)) {
      studentMap.set(row.student_id, {
        id: row.student_id,
        first_name: row.first_name,
        last_name: row.last_name,
        index_number: row.index_number,
        scores: []
      })
    }
    
    if (row.subject_code) {
      studentMap.get(row.student_id)!.scores.push({
        subject_code: row.subject_code,
        score: row.score ? Number(row.score) : null
      })
    }
  })

  // 3. Calculate aggregates AND SORT from lowest to highest (best to worst)
  const studentResults = Array.from(studentMap.values())
    .map(st => {
      const aggData = computeAggregate(st.scores)
      
      return {
        id: st.id,
        first_name: st.first_name,
        last_name: st.last_name,
        index_number: st.index_number,
        subjects_entered: st.scores.length,
        total_grade: aggData.aggregate,
        incomplete: aggData.incomplete
      }
    })
    .sort((a, b) => a.total_grade - b.total_grade) // 👈 Sort Lowest to Highest

  return (
    <div className="p-6 max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Master Results (Admin)</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ranked from the best performing student to the lowest.
        </p>
      </div>

      {/* Mock Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {publishedMocks.map(m => (
          <Button
            key={m.id}
            size="sm"
            variant={m.id === selectedMock.id ? "default" : "outline"}
            nativeButton={false}
            render={<Link href={`/dashboard/admin-results?mock=${m.id}`} />}
          >
            {m.name}
          </Button>
        ))}
      </div>

      {/* Results Table */}
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left border-b">
            <tr>
              <th className="px-4 py-3 font-medium w-16 text-center">Rank</th>
              <th className="px-4 py-3 font-medium">Index Number</th>
              <th className="px-4 py-3 font-medium">Student Name</th>
              <th className="px-4 py-3 font-medium text-center">Subjects Entered</th>
              <th className="px-4 py-3 font-medium text-center">Aggregate</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {studentResults.map((st, index) => (
              <tr key={st.id} className="hover:bg-muted/10">
                <td className="px-4 py-3 text-center font-bold text-muted-foreground">
                  {index + 1}
                </td>
                <td className="px-4 py-3 text-muted-foreground font-mono">{st.index_number}</td>
                <td className="px-4 py-3 font-medium">{st.first_name} {st.last_name}</td>
                <td className="px-4 py-3 text-center text-muted-foreground">
                  {st.subjects_entered} / 9
                </td>
                <td className="px-4 py-3 text-center font-bold text-primary">
                  {st.total_grade ? st.total_grade : "-"}
                  {st.incomplete && <span className="ml-1 text-[10px] text-red-500 font-normal">*</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    nativeButton={false}
                    render={<Link href={`/dashboard/results?mock=${selectedMock.id}&student=${st.id}`} />}
                  >
                    <FileTextIcon className="mr-2 h-4 w-4" /> View Slip
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}