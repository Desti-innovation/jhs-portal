import Link from "next/link"
import { requireRole } from "@/lib/auth"
import { listMocks } from "@/lib/mocks"
import { listStudents } from "@/lib/scores"
import { getStudentResult } from "@/lib/results"
import { Button } from "@/components/ui/button"
import { BECEPrintSlip } from "./bece-print-slip"

export const instant = false

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ mock?: string; student?: string }>
}) {
  // Allow HOD, Admin, and Parent
  const user = await requireRole("hod", "admin", "parent") 
  const { mock: mockId, student: studentId } = await searchParams

  const allMocks = await listMocks()
  // Only show published mocks for results
  const publishedMocks = allMocks.filter((m) => m.status === "published")
  const selectedMock = mockId
    ? publishedMocks.find((m) => m.id === mockId) ?? null
    : publishedMocks[0] ?? null

  if (!selectedMock) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Results</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No published mocks yet. Please check back later.
        </p>
      </div>
    )
  }

  // -----------------------------------------
  // PARENT VIEW
  // -----------------------------------------
  if (user.role === "parent") {
    const myStudentId = user.id.replace("parent-", "")
    const resultData = await getStudentResult(selectedMock.id, myStudentId)

    return (
      <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/10 print:p-0 print:bg-white">
          {resultData ? (
            <BECEPrintSlip mock={selectedMock} data={resultData} />
          ) : (
            <p className="text-center text-muted-foreground">No results found.</p>
          )}
        </div>
      </div>
    )
  }

  // -----------------------------------------
  // HOD / ADMIN VIEW
  // -----------------------------------------
  const students = await listStudents()
  const activeStudentId = studentId || students[0]?.id
  const resultData = activeStudentId ? await getStudentResult(selectedMock.id, activeStudentId) : null

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Internal Header Bar - Student List (Hidden on Print) */}
      <div className="border-b bg-muted/20 px-4 py-3 overflow-x-auto whitespace-nowrap hide-scrollbar print:hidden">
        <div className="flex gap-2 max-w-full">
          {students.map((st) => (
            <Button
              key={st.id}
              size="sm"
              variant={st.id === activeStudentId ? "default" : "outline"}
              nativeButton={false}
              render={
                <Link href={`/dashboard/results?mock=${selectedMock.id}&student=${st.id}`} />
              }
            >
              {st.first_name} {st.last_name}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Result Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/10 print:p-0 print:bg-white">
        {resultData ? (
          <BECEPrintSlip mock={selectedMock} data={resultData} />
        ) : (
          <p className="text-center text-muted-foreground">Select a student to view results.</p>
        )}
      </div>
    </div>
  )
}