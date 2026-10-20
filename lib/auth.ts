import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/db"

// lib/auth.ts
export type Role = "hod" | "teacher" | "parent" | "admin" | "headmaster"

export type SessionUser = {
  id: string
  name: string
  email: string
  role: Role
  avatar_url?: string | null
}

const COOKIE_NAME = "jhs_session"
const JWT_ALG = "HS256"
const SESSION_DAYS = 7

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET is not set")
  return new TextEncoder().encode(secret)
}

// ---------- Password ----------
export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10)
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash)
}

// ---------- JWT ----------
export async function signSession(user: SessionUser) {
  const secret = getSecret()
  const token = await new SignJWT({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar_url: user.avatar_url ?? null,
  })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret)
  return token
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: [JWT_ALG],
    })
    return {
      id: String(payload.sub),
      name: String(payload.name),
      email: String(payload.email),
      role: payload.role as Role,
      avatar_url: (payload.avatar_url as string | null) ?? null,
    }
  } catch {
    return null
  }
}

// ---------- Cookie ----------
export async function setSessionCookie(token: string) {
  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  })
}

export async function clearSessionCookie() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

// ---------- Read current session ----------
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySession(token)
}

// ---------- Require role ----------
export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser()

  // No session → go to login
  if (!user) {
    redirect("/login")
  }

  // Wrong role → go to dashboard (never throws a red error page)
  if (roles.length && !roles.includes(user.role)) {
    redirect("/dashboard")
  }

  return user
}

// ---------- Login (verifies against DB) ----------
export async function loginWithCredentials(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const rows = (await sql`
    SELECT id, name, email, password_hash, role, avatar_url, is_active
    FROM users
    WHERE email = ${email.toLowerCase()}
    LIMIT 1
  `) as {
    id: string
    name: string
    email: string
    password_hash: string
    role: Role
    avatar_url: string | null
    is_active: boolean
  }[]

  const row = rows[0]
  if (!row || !row.is_active) return null

  const ok = await verifyPassword(password, row.password_hash)
  if (!ok) return null

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    avatar_url: row.avatar_url,
  }
}