"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createMock, transitionMock } from "@/lib/mocks"
import { requireRole } from "@/lib/auth"

export async function createMockAction(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const user = await requireRole("hod")

  const name = String(formData.get("name") ?? "").trim()
  const term = String(formData.get("term") ?? "").trim()
  const academic_year = String(formData.get("academic_year") ?? "").trim()
  const opens_at = (formData.get("opens_at") as string) || null
  const closes_at = (formData.get("closes_at") as string) || null

  if (!name || !term || !academic_year) {
    return { error: "Name, term, and academic year are required" }
  }

  const mock = await createMock({
    name,
    term,
    academic_year,
    opens_at: opens_at ? new Date(opens_at).toISOString() : null,
    closes_at: closes_at ? new Date(closes_at).toISOString() : null,
    created_by: user.id,
  })

  revalidatePath("/dashboard/mocks")
  
  // 👇 Corrected path
  redirect(`/dashboard/mocks/${mock.id}`)
}

export async function transitionMockAction(id: string, action: string) {
  const user = await requireRole("hod")

  if (!["activate", "lock", "publish", "reopen"].includes(action)) {
    throw new Error("Invalid action")
  }

  await transitionMock(id, action as "activate" | "lock" | "publish" | "reopen")
  
  revalidatePath("/dashboard/mocks")
  revalidatePath(`/dashboard/mocks/${id}`)
}