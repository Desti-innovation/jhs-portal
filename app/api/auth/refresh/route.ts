import { NextResponse } from "next/server"
import { getCurrentUser, signSession, setSessionCookie } from "@/lib/auth"

export async function POST() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Generate a new token with the current timestamp
  const token = await signSession({
    ...user,
    lastActivity: Date.now(),
  })
  
  await setSessionCookie(token)
  return NextResponse.json({ success: true })
}