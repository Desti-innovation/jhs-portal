import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { NotificationBell } from "@/components/notification-bell"
import { ModeToggle } from "@/components/mode-toggel"
import { NavUser } from "@/components/nav-user"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar" // Added SidebarTrigger
import { getCurrentUser } from "@/lib/auth"
import { SessionTimeout } from "@/components/session-timeout"

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
      <SessionTimeout />
      <AppSidebar user={user} />
      <SidebarInset>
        {/* Changed to justify-between to push the trigger left and icons right */}
        <header className="flex h-14 items-center justify-between border-b px-4">
          
          {/* Left side: Hamburger Menu for mobile */}
          <div className="flex items-center gap-2">
            <SidebarTrigger />
          </div>

          {/* Right side: Notifications, Theme, User Profile */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <ModeToggle />
            <NavUser user={user} variant="header" />
          </div>
          
        </header>
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}