import { NextResponse, type NextRequest } from "next/server"
// import { verifySession } from "@/lib/auth"
import { verifySession } from "@/lib/auth-edge"

const PUBLIC_PATHS = ["/login"]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next()
  }

  const token = req.cookies.get("jhs_session")?.value
  const user = token ? await verifySession(token) : null

  if (!user) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}