"use server"

import { requireRole } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function generateInviteAction(role: string) {
  await requireRole("hod", "admin")

  if (!["teacher", "admin", "headmaster"].includes(role)) {
    return { error: "Invalid role" }
  }

  // Generate a random secure token
  const token = crypto.randomUUID()
  
  // Expires in 24 hours
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24)

  try {
    await sql`
      INSERT INTO invites (token, role, expires_at)
      VALUES (${token}, ${role}, ${expiresAt.toISOString()})
    `
    return { success: true, token }
  } catch (error) {
    return { error: "Failed to generate link" }
  }
}