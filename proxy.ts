import { NextResponse, type NextRequest } from "next/server"
import { verifySession } from "@/lib/auth-edge"

const PUBLIC_PATHS = ["/login", "/parent-login", "/invite"]

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1. Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next()
  }

  // 2. Check for session
  const token = req.cookies.get("jhs_session")?.value
  const user = token ? await verifySession(token) : null

  if (!user) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  // 3. Inactivity timeout (10 minutes)
  const INACTIVITY_TIMEOUT = 10 * 60 * 1000 // 10 minutes in ms
  const now = Date.now()
  const lastActivity = user.lastActivity || 0

  if (now - lastActivity > INACTIVITY_TIMEOUT) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("error", "session_expired")
    
    const response = NextResponse.redirect(url)
    response.cookies.delete("jhs_session")
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}