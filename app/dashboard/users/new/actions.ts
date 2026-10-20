"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireRole, hashPassword } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function createStaffAction(
  prevState: { error?: string } | null,
  formData: FormData
) {
  await requireRole("hod", "admin")

  const name = String(formData.get("name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const role = String(formData.get("role") ?? "")
  const password = String(formData.get("password") ?? "")

  if (!name || !email || !role || !password) {
    return { error: "All fields are required." }
  }

  // ✅ Added "headmaster" to the allowed roles
  if (!["teacher", "hod", "admin", "headmaster"].includes(role)) {
    return { error: "Invalid role selected." }
  }

  try {
    const hash = await hashPassword(password)
    
    await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${name}, ${email}, ${hash}, ${role})
    `
  } catch (error: any) {
    if (error.code === '23505') {
      return { error: "A user with this email already exists." }
    }
    return { error: "Failed to create user. Please try again." }
  }

  revalidatePath("/dashboard/users")
  redirect("/dashboard/users")
}