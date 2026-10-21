"use server"

import { hashPassword } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function acceptInviteAction(
  token: string,
  role: string,
  formData: FormData
) {
  const name = String(formData.get("name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")

  if (!name || !email || !password) {
    return { error: "All fields are required." }
  }

  // 1. Double check the invite is still valid (race condition protection)
  const invites = await sql`
    SELECT id FROM invites 
    WHERE token = ${token} AND used = FALSE AND expires_at > now()
  `

  if (invites.length === 0) {
    return { error: "This link has expired or already been used." }
  }

  try {
    const hash = await hashPassword(password)
    
    // 2. Create the user
    await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${name}, ${email}, ${hash}, ${role})
    `

    // 3. Burn the invite so it can never be used again
    await sql`
      UPDATE invites SET used = TRUE WHERE token = ${token}
    `
    
    return { success: true }
  } catch (error: any) {
    if (error.code === '23505') {
      return { error: "A user with this email already exists." }
    }
    return { error: "Failed to create account." }
  }
}