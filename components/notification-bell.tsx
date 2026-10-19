"use client"

import { BellIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// placeholder — swap with real notifications later
const notifications = [
  {
    id: "1",
    title: "Mock 1 published",
    description: "Mathematics scores are now visible to parents.",
    time: "2m ago",
    unread: true,
  },
  {
    id: "2",
    title: "New score submitted",
    description: "Mr. Mensah entered English scores for JSS2A.",
    time: "1h ago",
    unread: true,
  },
  {
    id: "3",
    title: "Reminder",
    description: "Mock 2 closes in 3 days.",
    time: "yesterday",
    unread: false,
  },
]

export function NotificationBell() {
  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="relative">
            <BellIcon className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">
                {unreadCount}
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {unreadCount} unread
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            You're all caught up.
          </div>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="flex flex-col items-start gap-0.5 py-2"
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-sm font-medium">{n.title}</span>
                <span className="text-xs text-muted-foreground">{n.time}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {n.description}
              </span>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center text-sm">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}