"use server"

import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { signSession, setSessionCookie } from "@/lib/auth"

export async function parentLoginAction(
  prevState: { error?: string } | null,
  formData: FormData
) {
  const firstName = String(formData.get("firstName") ?? "").trim().toLowerCase()
  const lastName = String(formData.get("lastName") ?? "").trim().toLowerCase()
  const phone = String(formData.get("phone") ?? "").trim()
  const dob = String(formData.get("dob") ?? "").trim()

  if (!firstName || !lastName || !phone || !dob) {
    return { error: "All fields are required." }
  }

  // Find the student matching ALL these details
  const students = await sql`
    SELECT id, first_name, last_name
    FROM students
    WHERE LOWER(first_name) = ${firstName}
      AND LOWER(last_name) = ${lastName}
      AND (father_phone = ${phone} OR mother_phone = ${phone})
      AND date_of_birth = ${dob}
  ` as { id: string, first_name: string, last_name: string }[]

  if (students.length === 0) {
    return { error: "No student found matching those exact details." }
  }

  const student = students[0]

  // Create a special Parent session tied to the STUDENT ID
  // We use a fake email here since parents don't have standard accounts
  const sessionUser = {
    id: `parent-${student.id}`, // custom ID to identify parent sessions
    name: `Parent of ${student.first_name}`,
    email: `${student.first_name}@parent.local`,
    role: "parent" as const,
    avatar_url: null
  }

  const token = await signSession(sessionUser)
  await setSessionCookie(token)

  redirect("/dashboard/results")
}