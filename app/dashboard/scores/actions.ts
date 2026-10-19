"use server"

import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth"
import { upsertScore, listSubjectsForUser } from "@/lib/scores"
import { getMock } from "@/lib/mocks"

export async function saveScoreAction(formData: FormData) {
  const user = await requireRole("hod", "admin", "teacher")

  const mockId = String(formData.get("mock_id") ?? "")
  const studentId = String(formData.get("student_id") ?? "")
  const subjectId = String(formData.get("subject_id") ?? "")
  const raw = formData.get("score")

  if (!mockId || !studentId || !subjectId) {
    return { error: "Missing fields" }
  }

  // Teachers may only enter scores for their assigned subjects
  if (user.role === "teacher") {
    const allowed = await listSubjectsForUser(user.id, user.role)
    if (!allowed.some((s) => s.id === subjectId)) {
      return { error: "You are not assigned to this subject" }
    }
  }

  const mock = await getMock(mockId)
  if (!mock) return { error: "Mock not found" }
  if (mock.status !== "active") {
    return { error: "Score entry is only allowed for active mocks" }
  }

  let score: number | null = null
  if (raw != null && String(raw).trim() !== "") {
    const n = Number(raw)
    if (Number.isNaN(n) || n < 0 || n > 100) {
      return { error: "Score must be between 0 and 100" }
    }
    score = n
  }

  await upsertScore({
    mock_id: mockId,
    student_id: studentId,
    subject_id: subjectId,
    score,
    entered_by: user.id,
  })

  revalidatePath("/dashboard/scores")
  return { success: true }
}