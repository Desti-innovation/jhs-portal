import { NextResponse, type NextRequest } from "next/server"
import { verifySession } from "@/lib/auth-edge"

const PUBLIC_PATHS = ["/login", "/parent-login", "/invite"]

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1. Log Page Visits
  // We ignore API routes, static Next.js files, and files with extensions (like .png, .ico)
  if (
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/api") &&
    !pathname.includes(".")
  ) {
    // Fire and forget (don't await it, so it doesn't slow down the user)
    fetch(`${req.nextUrl.origin}/api/track-visit`, { method: "POST" }).catch(() => {})
  }

  // 2. Allow public paths (Login, Parent Login, Invites)
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next()
  }

  // 3. Check for session
  const token = req.cookies.get("jhs_session")?.value
  const user = token ? await verifySession(token) : null

  if (!user) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  // 4. Inactivity timeout (10 minutes)
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
  // 👇 Expanded matcher to catch the root page and dashboard pages
  matcher: [
    "/",
    "/dashboard/:path*",
    "/login",
    "/parent-login",
    "/invite/:path*"
  ],
}