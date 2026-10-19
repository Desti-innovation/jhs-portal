import { notFound } from "next/navigation"
import Link from "next/link"
import { requireRole } from "@/lib/auth"
import { getMock } from "@/lib/mocks"
import { sql } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, TrophyIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const instant = false

export default async function MockAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireRole("hod", "admin")
  const { id } = await params

  const mock = await getMock(id)
  if (!mock) notFound()

  // 1. Top 5 Students (Aggregate)
  const topStudents = (await sql`
    SELECT 
      s.first_name || ' ' || s.last_name as name,
      s.index_number,
      SUM(sc.grade::int) as aggregate
    FROM students s
    JOIN scores sc ON sc.student_id = s.id
    WHERE sc.mock_id = ${id}
    GROUP BY s.id, s.first_name, s.last_name, s.index_number
    ORDER BY aggregate ASC
    LIMIT 5
  `) as { name: string; index_number: string; aggregate: string }[]

  // 2. Subject Averages & Pass Rates
  const subjectStats = (await sql`
    SELECT 
      sub.name,
      sub.code,
      COUNT(sc.id) as total_entered,
      ROUND(AVG(sc.score), 1) as avg_score,
      SUM(CASE WHEN sc.grade::int <= 6 THEN 1 ELSE 0 END) as passes
    FROM subjects sub
    JOIN scores sc ON sc.subject_id = sub.id
    WHERE sc.mock_id = ${id}
    GROUP BY sub.id, sub.name, sub.code
    ORDER BY sub.name ASC
  `) as { name: string; code: string; total_entered: string; avg_score: string; passes: string }[]

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href="/dashboard" />}
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{mock.name} Analysis</h1>
        <p className="text-muted-foreground mt-1">
          {mock.term} · {mock.academic_year}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrophyIcon className="h-5 w-5 text-yellow-500" />
              Top Performing Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scores entered yet.</p>
            ) : (
              <div className="space-y-4">
                {topStudents.map((st, i) => (
                  <div key={st.index_number} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-muted-foreground w-4">{i + 1}.</span>
                      <div>
                        <p className="font-medium text-sm">{st.name}</p>
                        <p className="text-xs text-muted-foreground">{st.index_number}</p>
                      </div>
                    </div>
                    <div className="font-bold text-emerald-600">
                      Agg: {st.aggregate}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {subjectStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scores entered yet.</p>
            ) : (
              <div className="space-y-4">
                {subjectStats.map((sub) => {
                  const passRate = Math.round((Number(sub.passes) / Number(sub.total_entered)) * 100)
                  return (
                    <div key={sub.code} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{sub.name}</span>
                        <span className="text-muted-foreground">
                          Avg: {sub.avg_score} · Pass: {passRate}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full ${
                            passRate >= 50 ? "bg-emerald-500" : "bg-destructive"
                          }`}
                          style={{ width: `${passRate}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}