import Link from "next/link"
import { requireRole } from "@/lib/auth"
import { sql } from "@/lib/db"
import { listMocks } from "@/lib/mocks"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrophyIcon, TrendingUpIcon, CheckCircleIcon, XCircleIcon } from "lucide-react"
import { SchoolAnalyticsCharts } from "./analytics-charts"
import { computeAggregate } from "@/lib/grading" // 👈 Import the exact logic

export const instant = false

export default async function AnalyticsPage({
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
    return (
      <div className="p-6 text-center text-muted-foreground">
        No published mocks available. Publish a mock to view analytics.
      </div>
    )
  }

  // 1. Get Overall Stats
  const overallStatsRes = await sql`
    SELECT 
      COUNT(*) as total_entries,
      SUM(CASE WHEN grade::int <= 6 THEN 1 ELSE 0 END) as total_passes,
      SUM(CASE WHEN grade::int >= 7 THEN 1 ELSE 0 END) as total_fails,
      AVG(score) as overall_average
    FROM scores
    WHERE mock_id = ${selectedMock.id}
  `
  const overallStats = overallStatsRes[0] as { total_entries: string, total_passes: string, total_fails: string, overall_average: string }
  
  const passRate = Number(overallStats.total_entries) > 0 
    ? Math.round((Number(overallStats.total_passes) / Number(overallStats.total_entries)) * 100) 
    : 0

  // 2. Subject Averages
  const subjectStatsRes = await sql`
    SELECT 
      s.name,
      AVG(sc.score) as average
    FROM scores sc
    JOIN subjects s ON s.id = sc.subject_id
    WHERE sc.mock_id = ${selectedMock.id}
    GROUP BY s.id, s.name
    ORDER BY average DESC
  `
  const subjectData = (subjectStatsRes as { name: string, average: string }[]).map(s => ({
    name: s.name,
    average: Number(Number(s.average).toFixed(1))
  }))

  // 3. Grade Distribution
  const gradeDistRes = await sql`
    SELECT grade, COUNT(*) as count
    FROM scores
    WHERE mock_id = ${selectedMock.id}
    GROUP BY grade
    ORDER BY grade
  `
  const COLORS = ["#10b981", "#34d399", "#a3e635", "#facc15", "#fbbf24", "#f97316", "#f87171", "#ef4444", "#dc2626"]
  const gradeData = (gradeDistRes as { grade: string, count: string }[]).map(g => ({
    name: `Grade ${g.grade}`,
    value: Number(g.count),
    fill: COLORS[Number(g.grade) - 1] || "hsl(var(--muted))"
  }))

  // 4. Top 10 Students (Using JS logic for aggregate)
  // First, fetch raw scores for all students in this mock
  const allScoresRes = await sql`
    SELECT 
      s.id as student_id,
      s.first_name || ' ' || s.last_name as name,
      s.index_number,
      sub.code as subject_code,
      sc.score
    FROM students s
    JOIN scores sc ON sc.student_id = s.id
    JOIN subjects sub ON sub.id = sc.subject_id
    WHERE sc.mock_id = ${selectedMock.id}
  `
  const allScores = allScoresRes as { student_id: string, name: string, index_number: string, subject_code: string, score: string }[]

  // Group scores by student
  const studentsMap = new Map<string, { name: string, index_number: string, scores: { subject_code: string, score: number | null }[] }>()
  
  allScores.forEach(row => {
    if (!studentsMap.has(row.student_id)) {
      studentsMap.set(row.student_id, { 
        name: row.name, 
        index_number: row.index_number, 
        scores: [] 
      })
    }
    studentsMap.get(row.student_id)!.scores.push({
      subject_code: row.subject_code,
      score: Number(row.score)
    })
  })

  // Calculate aggregate using the EXACT same function as the slip
  const topStudents = Array.from(studentsMap.values())
    .map(st => {
      const aggData = computeAggregate(st.scores)
      return {
        name: st.name,
        index_number: st.index_number,
        aggregate: aggData.aggregate
      }
    })
    .sort((a, b) => a.aggregate - b.aggregate) // Sort ascending (lower is better)
    .slice(0, 10)

  return (
    <div className="p-6 max-w-6xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">School Analytics</h1>
          <p className="text-muted-foreground mt-1">{selectedMock.name} · {selectedMock.term}</p>
        </div>
        
        {/* Mock Selector */}
        {publishedMocks.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {publishedMocks.map(m => (
              <Button
                key={m.id}
                size="sm"
                variant={m.id === selectedMock.id ? "default" : "outline"}
                nativeButton={false}
                render={<Link href={`/dashboard/analytics?mock=${m.id}`} />}
              >
                {m.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Top Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overall Average</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(overallStats.overall_average).toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <TrophyIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{passRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Passes</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.total_passes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Fails</CardTitle>
            <XCircleIcon className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.total_fails}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <SchoolAnalyticsCharts subjectData={subjectData} gradeData={gradeData} />

      {/* Top Students Leaderboard */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Top 10 Students (Best 6 Aggregate)</h2>
        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Rank</th>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Index</th>
                <th className="px-4 py-3 text-right font-medium">Aggregate</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {topStudents.map((st, i) => (
                <tr key={st.index_number} className="hover:bg-muted/10">
                  <td className="px-4 py-3 font-bold text-muted-foreground">#{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{st.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{st.index_number}</td>
                  <td className="px-4 py-3 text-right font-bold text-primary">{st.aggregate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}