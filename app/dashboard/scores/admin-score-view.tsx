"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { saveScoreAction } from "./actions"
import { gradeFor } from "@/lib/grading"
import type { StudentRow, SubjectRow } from "@/lib/scores"

type Existing = Record<string, { score: number | null; grade: number | null }>

export function AdminScoreView({
  mockId,
  students,
  subjects,
  existing,
}: {
  mockId: string
  students: StudentRow[]
  subjects: SubjectRow[]
  existing: Existing
}) {
  const [local, setLocal] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  function initial(studentId: string, subjectId: string): string {
    const k = `${studentId}:${subjectId}`
    if (k in local) return local[k]
    const e = existing[k]
    return e?.score == null ? "" : String(e.score)
  }

  function getGradeInfo(studentId: string, subjectId: string) {
    const v = initial(studentId, subjectId)
    if (v === "") return { grade: "-", remark: "-", isPass: true }
    const n = Number(v)
    if (Number.isNaN(n)) return { grade: "-", remark: "-", isPass: true }
    return gradeFor(n)
  }

  async function handleSave(
    e: React.FormEvent<HTMLFormElement>,
    studentId: string,
    subjectId: string
  ) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const k = `${studentId}:${subjectId}`
    
    setSaving((prev) => ({ ...prev, [k]: true }))
    const res = await saveScoreAction(formData)
    setSaving((prev) => ({ ...prev, [k]: false }))
    
    if (res?.error) {
      alert(res.error)
    }
  }

  return (
    <div className="space-y-8 pb-10">
      {subjects.map((sub) => (
        <div key={sub.id} className="rounded-md border overflow-hidden">
          <div className="bg-muted/50 px-4 py-3 border-b">
            <h2 className="font-semibold text-lg">{sub.name}</h2>
          </div>
          
          <table className="w-full text-sm">
            <thead className="border-b text-left bg-muted/20">
              <tr>
                <th className="px-2 py-2 font-medium">Names</th>
                <th className="px-2 py-2 font-medium w-[85px]">Score</th>
                <th className="px-2 py-2 font-medium w-[50px] text-center">Grade</th>
                <th className="px-2 py-2 font-medium">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((st) => {
                const v = initial(st.id, sub.id)
                const info = getGradeInfo(st.id, sub.id)
                const k = `${st.id}:${sub.id}`
                const isSaving = saving[k]

                return (
                  <tr key={st.id} className="hover:bg-muted/10">
                    <td className="px-2 py-2">
                      <div className="font-medium text-xs sm:text-sm">
                        {st.first_name} {st.last_name}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {st.index_number}
                      </div>
                    </td>
                    
                    <td className="px-2 py-2">
                      <form
                        onSubmit={(e) => handleSave(e, st.id, sub.id)}
                        className="relative"
                      >
                        <input type="hidden" name="mock_id" value={mockId} />
                        <input type="hidden" name="student_id" value={st.id} />
                        <input type="hidden" name="subject_id" value={sub.id} />
                        
                        <Input
                          name="score"
                          type="number"
                          min={0}
                          max={100}
                          step="0.1"
                          value={v}
                          onChange={(e) =>
                            setLocal((prev) => ({ ...prev, [k]: e.target.value }))
                          }
                          onBlur={(e) => {
                            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                              const form = e.currentTarget.closest("form")
                              if (form) form.requestSubmit()
                            }
                          }}
                          className={`h-8 w-full text-center text-sm ${isSaving ? "opacity-50" : ""}`}
                          placeholder="—"
                          disabled={isSaving}
                        />
                      </form>
                    </td>

                    <td className={`px-2 py-2 text-center font-bold text-sm ${info.isPass ? "text-emerald-600" : "text-destructive"}`}>
                      {info.grade}
                    </td>

                    <td className="px-2 py-2 text-xs text-muted-foreground whitespace-nowrap">
                      {info.remark}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}