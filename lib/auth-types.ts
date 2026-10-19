export type Role = "hod" | "teacher" | "parent" | "admin"
export type SessionUser = {
  id: string
  name: string
  email: string
  role: Role
  avatar_url?: string | null
}