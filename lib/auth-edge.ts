import { jwtVerify } from "jose"
import type { Role } from "@/lib/auth-types"

export type SessionUser = {
  id: string
  name: string
  email: string
  role: Role
  avatar_url?: string | null
  lastActivity?: number // 👈 Added this
}

const JWT_ALG = "HS256"

export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret, { algorithms: [JWT_ALG] })
    return {
      id: String(payload.sub),
      name: String(payload.name),
      email: String(payload.email),
      role: payload.role as Role,
      avatar_url: (payload.avatar_url as string | null) ?? null,
      lastActivity: Number(payload.lastActivity) || 0, // 👈 Added this
    }
  } catch {
    return null
  }
}