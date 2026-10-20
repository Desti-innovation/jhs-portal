import Link from "next/link"
import { requireRole } from "@/lib/auth"
import { listMocks } from "@/lib/mocks"
import { sql } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon, FileTextIcon } from "lucide-react"

export const instant = false

export default async function AdminResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ mock?: string }>
}) {
//   await requireRole("admin", "hod")
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

  // Fetch every student and sum their grades for this mock
  const studentResults = await sql`
    SELECT 
      s.id, 
      s.first_name, 
      s.last_name, 
      s.index_number,
      (SELECT COUNT(*) FROM scores sc WHERE sc.student_id = s.id AND sc.mock_id = ${selectedMock.id}) as subjects_entered,
      (SELECT SUM(sc.grade::int) FROM scores sc WHERE sc.student_id = s.id AND sc.mock_id = ${selectedMock.id}) as total_grade
    FROM students s
    ORDER BY s.index_number ASC
  ` as { id: string, first_name: string, last_name: string, index_number: string, subjects_entered: string, total_grade: string | null }[]

  return (
    <div className="p-6 max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Master Results (Admin)</h1>
        <p className="text-muted-foreground text-sm mt-1">
          View all student results for a specific mock.
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
              <th className="px-4 py-3 font-medium">Index Number</th>
              <th className="px-4 py-3 font-medium">Student Name</th>
              <th className="px-4 py-3 font-medium text-center">Subjects Entered</th>
              <th className="px-4 py-3 font-medium text-center">Total Grade (Agg)</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {studentResults.map(st => (
              <tr key={st.id} className="hover:bg-muted/10">
                <td className="px-4 py-3 text-muted-foreground font-mono">{st.index_number}</td>
                <td className="px-4 py-3 font-medium">{st.first_name} {st.last_name}</td>
                <td className="px-4 py-3 text-center text-muted-foreground">
                  {st.subjects_entered} / 9
                </td>
                <td className="px-4 py-3 text-center font-bold">
                  {st.total_grade ? st.total_grade : "-"}
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