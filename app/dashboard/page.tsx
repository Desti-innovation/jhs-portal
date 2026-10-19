import { requireRole } from "@/lib/auth"
import { sql } from "@/lib/db"
import { listMocks } from "@/lib/mocks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MockStatusBadge } from "@/components/mock-status-badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { EyeIcon, DownloadIcon, UsersIcon, GraduationCapIcon, BookOpenIcon, ClipboardEditIcon } from "lucide-react"
import { DashboardCharts } from "./dashboard-charts"
import { TeacherSubjectCharts } from "./teacher-charts"

export const instant = false

export default async function DashboardPage() {
  const user = await requireRole("hod", "admin", "teacher", "parent")
  
  // -----------------------------------------------------
  // 1. TEACHER DASHBOARD
  // -----------------------------------------------------
  if (user.role === "teacher") {
    const [mySubjectsRes, allMocks, studentCountRes] = await Promise.all([
      sql`
        SELECT s.id, s.name, s.code
        FROM subjects s
        JOIN teacher_assignments ta ON ta.subject_id = s.id
        WHERE ta.teacher_id = ${user.id}
      `,
      listMocks(),
      sql`SELECT COUNT(*) as count FROM students`
    ])

    const mySubjects = mySubjectsRes as { id: string, name: string, code: string }[]
    const studentCount = studentCountRes as { count: string }[]
    const activeMocks = allMocks.filter(m => m.status === "active")
    const totalStudents = Number(studentCount[0].count)

    const subjectIds = mySubjects.map(s => s.id)
    const scoresRes = await sql`
      SELECT subject_id, mock_id, score 
      FROM scores 
      WHERE subject_id = ANY(${subjectIds})
    `
    const scores = scoresRes as { subject_id: string, mock_id: string, score: number }[]
    const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"]

    return (
      <div className="p-6 max-w-5xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user.name}.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Subjects</CardTitle>
              <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mySubjects.length}</div>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {mySubjects.map(s => s.code).join(", ") || "None assigned"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Mocks</CardTitle>
              <ClipboardEditIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeMocks.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Open for score entry</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <GraduationCapIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground mt-1">JHS 3</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight mb-4">Mocks Open for Scoring</h2>
          {activeMocks.length === 0 ? (
            <div className="border rounded-xl p-8 text-center text-sm text-muted-foreground bg-muted/10">
              There are no active mocks right now. Check back later.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {activeMocks.map(m => (
                <div key={m.id} className="flex flex-col border rounded-xl p-5 gap-4 bg-card shadow-sm hover:border-primary/50 transition-colors">
                  <div>
                    <h3 className="font-semibold text-lg">{m.name}</h3>
                    <p className="text-sm text-muted-foreground">{m.term} · {m.academic_year}</p>
                  </div>
                  <Button className="w-full" nativeButton={false} render={<Link href={`/dashboard/scores?mock=${m.id}`} />}>
                    Enter Scores
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {mySubjects.length > 0 && (
          <div className="pt-6 border-t space-y-6">
            <h2 className="text-xl font-bold tracking-tight">Subject Analytics</h2>
            {mySubjects.map(subject => {
              const subScores = scores.filter(s => s.subject_id === subject.id)
              const mockStats = new Map<string, { count: number, totalScore: number }>()
              
              subScores.forEach(s => {
                const existing = mockStats.get(s.mock_id) || { count: 0, totalScore: 0 }
                mockStats.set(s.mock_id, {
                  count: existing.count + 1,
                  totalScore: existing.totalScore + Number(s.score)
                })
              })

              const pieData = Array.from(mockStats.entries()).map(([mockId, stats], index) => {
                const mockName = allMocks.find(m => m.id === mockId)?.name || "Unknown Mock"
                return { name: mockName, value: stats.count, fill: COLORS[index % COLORS.length] }
              })

              const barData = Array.from(mockStats.entries()).map(([mockId, stats]) => {
                const mockName = allMocks.find(m => m.id === mockId)?.name || "Unknown Mock"
                return { name: mockName, avgScore: Number((stats.totalScore / stats.count).toFixed(1)) }
              })

              return (
                <TeacherSubjectCharts 
                  key={subject.id}
                  subjectName={subject.name}
                  pieData={pieData}
                  barData={barData}
                  lineData={barData}
                />
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // -----------------------------------------------------
  // 2. PARENT DASHBOARD
  // -----------------------------------------------------
  if (user.role === "parent") {
    const myStudentId = user.id.replace("parent-", "")
    const studentRes = await sql`
      SELECT * FROM students WHERE id = ${myStudentId}
    `
    const student = studentRes[0]
    
    // Get all published mocks, sorted newest to oldest
    const publishedMocks = (await listMocks()).filter(m => m.status === "published")
    const latestMock = publishedMocks[0] || null

    return (
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {student?.first_name}</h1>
          <p className="text-muted-foreground mt-1">Select a mock below to view your results.</p>
        </div>

        {publishedMocks.length === 0 ? (
          <div className="border rounded-md p-8 text-center text-muted-foreground bg-muted/10">
            Results are not published yet. Please check back later.
          </div>
        ) : (
          <div className="space-y-6">
            {/* LATEST Result */}
            {latestMock && (
              <Card className="border-primary/50 shadow-md bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{latestMock.name} (Latest)</span>
                    <span className="text-xs font-normal bg-primary text-primary-foreground px-2 py-1 rounded-full">New</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{latestMock.term} · {latestMock.academic_year}</p>
                </CardHeader>
                <CardContent>
                  <Button className="w-full sm:w-auto" nativeButton={false} render={<Link href={`/dashboard/results?mock=${latestMock.id}`} />}>
                    View Result
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* PAST Results */}
            {publishedMocks.length > 1 && (
              <div className="pt-4">
                <h2 className="text-lg font-semibold mb-3">Past Mocks</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {publishedMocks.slice(1).map(m => (
                    <div key={m.id} className="flex flex-col border rounded-xl p-4 gap-3 bg-card">
                      <div>
                        <h3 className="font-semibold">{m.name}</h3>
                        <p className="text-sm text-muted-foreground">{m.term} · {m.academic_year}</p>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-2" nativeButton={false} render={<Link href={`/dashboard/results?mock=${m.id}`} />}>
                        View Result
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // -----------------------------------------------------
  // 3. HOD / ADMIN DASHBOARD
  // -----------------------------------------------------
  const [mocks, statsResult, viewsResult, visitsResult] = await Promise.all([
    listMocks(),
    sql`
      SELECT
        (SELECT COUNT(*) FROM students) AS students,
        (SELECT COUNT(*) FROM users WHERE role = 'teacher') AS teachers,
        (SELECT COUNT(*) FROM users WHERE role = 'parent') AS parents
    `,
    sql`
      SELECT action, COUNT(*) as count 
      FROM result_logs 
      GROUP BY action
    `,
    sql`SELECT COUNT(*) as count FROM page_visits`
  ])

  const stats = statsResult[0] as { students: string; teachers: string; parents: string }
  
  let views = 0
  let downloads = 0
  for (const row of viewsResult) {
    if (row.action === 'view') views = Number(row.count)
    if (row.action === 'download') downloads = Number(row.count)
  }

  const totalVisits = Number(visitsResult[0].count)
  const recentMocks = mocks.slice(0, 4)

  const pieData = [
    { name: "Results Viewed", value: views, fill: "hsl(var(--chart-1))" },
    { name: "Results Downloaded", value: downloads, fill: "hsl(var(--chart-2))" },
    { name: "Not Viewed Yet", value: Math.max(0, Number(stats.students) - views), fill: "hsl(var(--muted))" },
  ]

  const barData = mocks.map(m => ({
    name: m.name,
    filled: 45,
  }))

  return (
    <div className="p-6 max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here is what is happening today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCapIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.students}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Results Viewed</CardTitle>
            <EyeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{views}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Results Downloaded</CardTitle>
            <DownloadIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{downloads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Site Visits</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisits}</div>
          </CardContent>
        </Card>
      </div>

      <DashboardCharts pieData={pieData} barData={barData} />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold tracking-tight">Mock Performance Analysis</h2>
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/dashboard/mocks" />}>
            View All Mocks
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {recentMocks.map((m) => (
            <Link 
              key={m.id} 
              href={`/dashboard/mocks/${m.id}/analysis`}
              className="group flex flex-col justify-between rounded-lg border p-4 hover:border-primary transition-colors bg-card"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{m.name}</h3>
                  <p className="text-sm text-muted-foreground">{m.term} · {m.academic_year}</p>
                </div>
                <MockStatusBadge status={m.status} />
              </div>
              <div className="mt-4 flex items-center text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                Click to view deep analysis →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}