"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { saveScoreAction } from "./actions"
import { gradeFor } from "@/lib/grading"
import type { StudentRow, SubjectRow } from "@/lib/scores"

type Existing = Record<string, { score: number | null; grade: number | null }>

export function ScoreEntryGrid({
  mockId,
  subject,
  students,
  existing,
}: {
  mockId: string
  subject: SubjectRow
  students: StudentRow[]
  existing: Existing
}) {
  const [local, setLocal] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  function initial(studentId: string): string {
    if (studentId in local) return local[studentId]
    const k = `${studentId}:${subject.id}`
    const e = existing[k]
    return e?.score == null ? "" : String(e.score)
  }

  function getGradeInfo(studentId: string) {
    const v = initial(studentId)
    if (v === "") return { grade: "-", remark: "-", isPass: true }
    const n = Number(v)
    if (Number.isNaN(n)) return { grade: "-", remark: "-", isPass: true }
    return gradeFor(n)
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>, studentId: string) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    setSaving((prev) => ({ ...prev, [studentId]: true }))
    const res = await saveScoreAction(formData)
    setSaving((prev) => ({ ...prev, [studentId]: false }))
    
    if (res?.error) {
      alert(res.error)
    }
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b text-left">
          <tr>
            <th className="px-2 py-2 font-medium">Names</th>
            <th className="px-2 py-2 font-medium w-[85px]">Score</th>
            <th className="px-2 py-2 font-medium w-[50px] text-center">Grade</th>
            <th className="px-2 py-2 font-medium">Remark</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {students.map((st) => {
            const v = initial(st.id)
            const info = getGradeInfo(st.id)
            const isSaving = saving[st.id]

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
                    onSubmit={(e) => handleSave(e, st.id)}
                    className="relative"
                  >
                    <input type="hidden" name="mock_id" value={mockId} />
                    <input type="hidden" name="student_id" value={st.id} />
                    <input type="hidden" name="subject_id" value={subject.id} />
                    
                    <Input
                      name="score"
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      value={v}
                      onChange={(e) =>
                        setLocal((prev) => ({ ...prev, [st.id]: e.target.value }))
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
  )
}