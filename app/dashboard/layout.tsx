import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { NotificationBell } from "@/components/notification-bell"
import { ModeToggle } from "@/components/mode-toggel"
import { NavUser } from "@/components/nav-user"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { getCurrentUser } from "@/lib/auth"
import { SessionTimeout } from "@/components/session-timeout" // 👈 Added

export const instant = false

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return (
    <SidebarProvider>
      <SessionTimeout /> {/* 👈 Added */}
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-14 items-center justify-end gap-2 border-b px-4">
          <NotificationBell />
          <ModeToggle />
          <NavUser user={user} variant="header" />
        </header>
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}