"use client"

import { useState } from "react"
import {
  gradeFor,
  computeAggregate,
  CORE_SUBJECT_CODES,
  ELECTIVE_SUBJECT_CODES,
} from "@/lib/grading"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const SUBJECTS: { code: string; label: string; core: boolean }[] = [
  { code: "ENG", label: "English Language", core: true },
  { code: "MTH", label: "Mathematics", core: true },
  { code: "SCI", label: "Science", core: true },
  { code: "SST", label: "Social Studies", core: true },
  { code: "RME", label: "Religious & Moral Education", core: false },
  { code: "CMP", label: "Computing", core: false },
  { code: "FAN", label: "Fante", core: false },
  { code: "CTE", label: "Career Technology", core: false },
  { code: "CRA", label: "Creative Arts", core: false },
]

export default function GradingPreviewPage() {
  const [scores, setScores] = useState<Record<string, string>>({})

  const numeric = SUBJECTS.map((s) => {
    const raw = scores[s.code]
    const val = raw === "" || raw == null ? null : Number(raw)
    return {
      ...s,
      raw,
      value: val,
      ...gradeFor(val),
    }
  })

  const result = computeAggregate(
    numeric.map((s) => ({ subject_code: s.code, score: s.value }))
  )

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold">Grading Preview</h1>
      <p className="text-sm text-muted-foreground">
        Type a score — grade, remark, and aggregate update live. Leave blank to
        simulate a missing subject.
      </p>

      <div className="mt-6 overflow-hidden rounded-md border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-2">Subject</th>
              <th className="w-28 px-4 py-2">Score</th>
              <th className="w-20 px-4 py-2">Grade</th>
              <th className="px-4 py-2">Remark</th>
              <th className="w-24 px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {numeric.map((s) => (
              <tr key={s.code} className="border-b last:border-0">
                <td className="px-4 py-2">
                  {s.label}
                  {s.core && (
                    <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                      Core
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step="0.1"
                    value={s.raw ?? ""}
                    onChange={(e) =>
                      setScores((prev) => ({
                        ...prev,
                        [s.code]: e.target.value,
                      }))
                    }
                    placeholder="—"
                  />
                </td>
                <td className="px-4 py-2 font-medium">{s.grade}</td>
                <td className="px-4 py-2 text-muted-foreground">{s.remark}</td>
                <td className="px-4 py-2">
                  {s.raw !== "" && s.raw != null ? (
                    s.isPass ? (
                      <Badge className="bg-emerald-600 text-white">Pass</Badge>
                    ) : (
                      <Badge className="bg-destructive text-white">Fail</Badge>
                    )
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-md border bg-muted/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Aggregate:{" "}
              <span className="text-primary">{result.aggregate}</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              4 core + best 2 electives · lower is better
            </p>
          </div>
          {result.incomplete && (
            <Badge className="bg-amber-500 text-white">
              Missing: {result.missingCores.join(", ")}
            </Badge>
          )}
        </div>

        <div className="mt-4">
          <h3 className="text-xs uppercase text-muted-foreground">
            Best 6 counted
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {result.bestSix.map((b) => (
              <Badge key={b.subject_code} variant="outline">
                {b.subject_code} · Grade {b.grade}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}