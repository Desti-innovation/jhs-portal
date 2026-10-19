"use server"

import { redirect } from "next/navigation"
import {
  loginWithCredentials,
  setSessionCookie,
  signSession,
  clearSessionCookie,
} from "@/lib/auth"

export async function loginAction(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) return { error: "Email and password are required" }

  const user = await loginWithCredentials(email, password)
  if (!user) return { error: "Invalid email or password" }

  const token = await signSession(user)
  await setSessionCookie(token)

  redirect("/dashboard")
}

export async function logoutAction() {
  await clearSessionCookie()
  redirect("/login")
}