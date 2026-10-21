"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createMock, transitionMock, getMock } from "@/lib/mocks"
import { requireRole } from "@/lib/auth"

export async function createMockAction(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const user = await requireRole("hod", "admin")

  const name = String(formData.get("name") ?? "").trim()
  const term = String(formData.get("term") ?? "").trim()
  const academic_year = String(formData.get("academic_year") ?? "").trim()
  
  const opens_at = (formData.get("opens_at") as string) || null
  const closes_at = (formData.get("closes_at") as string) || null

  if (!name || !term || !academic_year) {
    return { error: "Name, term, and academic year are required" }
  }

  let mockId: string

  try {
    const mock = await createMock({
      name,
      term,
      academic_year,
      opens_at: opens_at ? new Date(opens_at).toISOString() : null,
      closes_at: closes_at ? new Date(closes_at).toISOString() : null,
      created_by: user.id,
    })
    mockId = mock.id
  } catch (error) {
    console.error("Create mock error:", error)
    return { error: "Failed to create mock. Database error." }
  }

  revalidatePath("/dashboard/mocks")
  redirect(`/dashboard/mocks/${mockId}`)
}

export async function transitionMockAction(id: string, action: string) {
  const user = await requireRole("hod", "admin")

  if (!["activate", "lock", "publish", "reopen"].includes(action)) {
    return { error: "Invalid action" }
  }

  try {
    const mock = await getMock(id)
    if (!mock) return { error: "Mock not found" }

    await transitionMock(id, action as "activate" | "lock" | "publish" | "reopen")
  } catch (error: any) {
    console.error("Transition error:", error)
    // If it's a known validation error from lib/mocks.ts, return it
    return { error: error.message || "Failed to update status" }
  }

  revalidatePath("/dashboard/mocks")
  revalidatePath(`/dashboard/mocks/${id}`)
}