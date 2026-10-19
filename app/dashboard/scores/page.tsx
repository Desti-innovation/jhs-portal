import Link from "next/link"
import { redirect } from "next/navigation"
import { requireRole } from "@/lib/auth"
import { listMocks } from "@/lib/mocks"
import { listStudents, listSubjectsForUser, scoresForMock } from "@/lib/scores"
import { Button } from "@/components/ui/button"
import { ScoreEntryGrid } from "./score-entry-grid"
import { AdminScoreView } from "./admin-score-view"

export const instant = false

export default async function ScoresPage({
  searchParams,
}: {
  searchParams: Promise<{ mock?: string; subject?: string }>
}) {
  const user = await requireRole("hod", "admin", "teacher")
  const { mock: mockId, subject: subjectId } = await searchParams

  const allMocks = await listMocks()
  const activeMocks = allMocks.filter((m) => m.status === "active")
  const selectedMock = mockId
    ? allMocks.find((m) => m.id === mockId) ?? null
    : activeMocks[0] ?? null

  if (!selectedMock) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Enter Scores</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No active mock yet.
        </p>
      </div>
    )
  }

  if (selectedMock.status !== "active") {
    redirect("/dashboard/scores")
  }

  const [students, subjects] = await Promise.all([
    listStudents(),
    listSubjectsForUser(user.id, user.role),
  ])

  if (subjects.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Enter Scores</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You have no subjects assigned.
        </p>
      </div>
    )
  }

  const existing = await scoresForMock(selectedMock.id)

  // 👇 ADMIN / HOD VIEW (Stacked Subjects) 👇
  if (user.role === "hod" || user.role === "admin") {
    return (
      <div className="p-4 md:p-6 w-full max-w-4xl mx-auto">
        <div className="flex flex-col gap-1 mb-6">
          <h1 className="text-2xl font-semibold">All Scores</h1>
          <p className="text-sm text-muted-foreground">
            {selectedMock.name} · {selectedMock.term}
          </p>
        </div>

        <AdminScoreView
          mockId={selectedMock.id}
          students={students}
          subjects={subjects}
          existing={existing}
        />
      </div>
    )
  }

  // 👇 TEACHER VIEW (Subject Tabs) 👇
  const selectedSubject = subjectId
    ? subjects.find((s) => s.id === subjectId) ?? subjects[0]
    : subjects[0]

  return (
    <div className="p-4 md:p-6 w-full max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Enter Scores</h1>
        <p className="text-sm text-muted-foreground">
          {selectedMock.name} · {selectedMock.term}
        </p>
      </div>

      <div className="mt-6 flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
        {subjects.map((sub) => (
          <Button
            key={sub.id}
            size="sm"
            variant={sub.id === selectedSubject.id ? "default" : "outline"}
            nativeButton={false}
            render={<Link href={`/dashboard/scores?mock=${selectedMock.id}&subject=${sub.id}`} />}
            className="whitespace-nowrap"
          >
            {sub.name}
          </Button>
        ))}
      </div>

      <div className="mt-4">
        <ScoreEntryGrid
          mockId={selectedMock.id}
          subject={selectedSubject}
          students={students}
          existing={existing}
        />
      </div>
    </div>
  )
}