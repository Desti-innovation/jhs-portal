"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export function SessionTimeout() {
  const router = useRouter()
  const lastRefresh = useRef(Date.now())

  useEffect(() => {
    // Ping the server every 2 minutes if the user is active
    const REFRESH_INTERVAL = 2 * 60 * 1000 

    const handleActivity = async () => {
      const now = Date.now()
      if (now - lastRefresh.current > REFRESH_INTERVAL) {
        lastRefresh.current = now
        try {
          // Silently refresh the cookie in the background
          const res = await fetch("/api/auth/refresh", { method: "POST" })
          if (!res.ok) {
            // If the session was already expired on the server
            router.push("/login?error=session_expired")
          }
        } catch (error) {
          console.error("Session refresh failed", error)
        }
      }
    }

    // Listen for activity
    window.addEventListener("mousemove", handleActivity)
    window.addEventListener("keydown", handleActivity)
    window.addEventListener("scroll", handleActivity)
    window.addEventListener("click", handleActivity)

    return () => {
      window.removeEventListener("mousemove", handleActivity)
      window.removeEventListener("keydown", handleActivity)
      window.removeEventListener("scroll", handleActivity)
      window.removeEventListener("click", handleActivity)
    }
  }, [router])

  return null
}