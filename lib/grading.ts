// lib/grading.ts

export type Grade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type GradeInfo = {
  grade: Grade
  remark: string
  isPass: boolean
}

const BANDS: { min: number; max: number; grade: Grade; remark: string }[] = [
  { min: 90, max: 100, grade: 1, remark: "Highest" },
  { min: 80, max: 89,  grade: 2, remark: "Higher" },
  { min: 70, max: 79,  grade: 3, remark: "High" },
  { min: 60, max: 69,  grade: 4, remark: "High Average" },
  { min: 55, max: 59,  grade: 5, remark: "Average" },
  { min: 50, max: 54,  grade: 6, remark: "Low Average" },
  { min: 45, max: 49,  grade: 7, remark: "Low" },
  { min: 40, max: 44,  grade: 8, remark: "Lower" },
  { min: 0,  max: 39,  grade: 9, remark: "Lowest" },
]

/**
 * Rounds the score to the nearest whole number, then maps it to a BECE grade.
 * Scores are assumed 0–100; anything out of range is clamped.
 * null/undefined → grade 9 (Lowest).
 */
export function gradeFor(score: number | null | undefined): GradeInfo {
  if (score == null || Number.isNaN(score)) {
    return { grade: 9, remark: "Lowest", isPass: false }
  }

  const rounded = Math.round(Math.max(0, Math.min(100, score)))
  const band = BANDS.find((b) => rounded >= b.min && rounded <= b.max)!
  const isPass = band.grade <= 6
  return { grade: band.grade, remark: band.remark, isPass }
}

// ---------- Aggregate ----------

/** The 4 subjects that must always count toward the aggregate. */
export const CORE_SUBJECT_CODES = ["ENG", "MTH", "SCI", "SST"] as const

/** All elective subjects — best 2 are counted toward the aggregate. */
export const ELECTIVE_SUBJECT_CODES = ["RME", "CMP", "FAN", "CTE", "CRA"] as const

export type SubjectScore = {
  subject_code: string
  score: number | null
}

export type BestSixEntry = {
  subject_code: string
  grade: Grade
}

export type AggregateResult = {
  /** Sum of the best 6 grades. Always a number — missing cores count as grade 9. */
  aggregate: number
  /** The 4 core subjects + best 2 electives, sorted best-first. */
  bestSix: BestSixEntry[]
  /** True if any core subject is missing a score (still computed with grade 9). */
  incomplete: boolean
  /** Codes of any core subjects with no score entered. */
  missingCores: string[]
}

/**
 * BECE aggregate: 4 core + best 2 electives.
 * Missing core → treated as grade 9; aggregate is still computed.
 * `incomplete` / `missingCores` let the UI show a warning.
 */
export function computeAggregate(scores: SubjectScore[]): AggregateResult {
  const byCode = new Map(scores.map((s) => [s.subject_code, s.score]))

  const missingCores: string[] = []
  const coreGrades: BestSixEntry[] = CORE_SUBJECT_CODES.map((code) => {
    const raw = byCode.get(code)
    if (raw == null) missingCores.push(code)
    const { grade } = gradeFor(raw)
    return { subject_code: code, grade }
  })

  const electiveGrades: BestSixEntry[] = ELECTIVE_SUBJECT_CODES
    .map((code) => ({
      subject_code: code,
      grade: gradeFor(byCode.get(code)).grade,
    }))
    // best = lowest grade number; missing electives are grade 9 so they rank last
    .sort((a, b) => a.grade - b.grade)
    .slice(0, 2)

  const bestSix = [...coreGrades, ...electiveGrades].sort(
    (a, b) => a.grade - b.grade
  )

  const aggregate = bestSix.reduce((sum, s) => sum + s.grade, 0)

  return {
    aggregate,
    bestSix,
    incomplete: missingCores.length > 0,
    missingCores,
  }
}