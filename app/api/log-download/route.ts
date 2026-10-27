import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== "parent") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { mockId } = await req.json()
  const studentId = user.id.replace("parent-", "")

  if (mockId) {
    await sql`
      INSERT INTO result_logs (student_id, mock_id, action)
      VALUES (${studentId}, ${mockId}, 'download')
    `
  }

  return NextResponse.json({ success: true })
}