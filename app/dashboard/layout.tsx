import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { NotificationBell } from "@/components/notification-bell"
import { ModeToggle } from "@/components/mode-toggel"
import { NavUser } from "@/components/nav-user"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
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
      <SidebarInset className="flex flex-col min-h-screen">
        
        {/* 👇 Added sticky top-0 z-50 bg-background 👇 */}
        <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <ModeToggle />
            <NavUser user={user} variant="header" />
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </div>
        
      </SidebarInset>
    </SidebarProvider>
  )
}