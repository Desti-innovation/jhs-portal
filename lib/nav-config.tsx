// lib/nav-config.tsx
import {
  LayoutDashboardIcon,
  FileTextIcon,
  UsersIcon,
  BookOpenIcon,
  ClipboardEditIcon,
  ChartBarIcon,
  Settings2Icon,
  FlaskConicalIcon,
  GraduationCapIcon,
  TableIcon,
} from "lucide-react"
import * as React from "react"

export type Role = "hod" | "teacher" | "parent" | "admin" | "headmaster"

export type NavItem = {
  title: string
  url: string
  icon?: React.ReactNode
}

export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  hod: [
    { title: "Dashboard",       url: "/dashboard",                 icon: <LayoutDashboardIcon /> },
    { title: "Mocks",           url: "/dashboard/mocks",           icon: <FileTextIcon /> },
    { title: "Enter Scores",    url: "/dashboard/scores",          icon: <ClipboardEditIcon /> },
    { title: "Master Results",  url: "/dashboard/admin-results",   icon: <TableIcon /> },
    { title: "Results (Slips)", url: "/dashboard/results",         icon: <ChartBarIcon /> },
    { title: "Students",        url: "/dashboard/students",        icon: <GraduationCapIcon /> },
    { title: "Users",           url: "/dashboard/users",           icon: <UsersIcon /> },
    { title: "Subjects",        url: "/dashboard/subjects",        icon: <BookOpenIcon /> },
    { title: "Grading Preview", url: "/dashboard/grading-preview", icon: <FlaskConicalIcon /> },
    { title: "Settings",        url: "/dashboard/settings",        icon: <Settings2Icon /> },
  ],
  teacher: [
    { title: "Dashboard",    url: "/dashboard",             icon: <LayoutDashboardIcon /> },
    { title: "Enter Scores", url: "/dashboard/scores",      icon: <ClipboardEditIcon /> },
    { title: "My Subjects",  url: "/dashboard/my-subjects", icon: <BookOpenIcon /> },
    { title: "Settings",     url: "/dashboard/settings",    icon: <Settings2Icon /> },
  ],
  parent: [
    { title: "Dashboard",          url: "/dashboard",          icon: <LayoutDashboardIcon /> },
    { title: "My Child's Results", url: "/dashboard/results",  icon: <ChartBarIcon /> },
    { title: "Settings",           url: "/dashboard/settings", icon: <Settings2Icon /> },
  ],
  admin: [
    { title: "Dashboard",       url: "/dashboard",                 icon: <LayoutDashboardIcon /> },
    { title: "Master Results",  url: "/dashboard/admin-results",   icon: <TableIcon /> },
    { title: "Students",        url: "/dashboard/students",        icon: <GraduationCapIcon /> },
    { title: "Mocks",           url: "/dashboard/mocks",           icon: <FileTextIcon /> },
    { title: "Enter Scores",    url: "/dashboard/scores",          icon: <ClipboardEditIcon /> },
    { title: "Results (Slips)", url: "/dashboard/results",         icon: <ChartBarIcon /> },
    { title: "Users",           url: "/dashboard/users",           icon: <UsersIcon /> },
    { title: "Subjects",        url: "/dashboard/subjects",        icon: <BookOpenIcon /> },
    { title: "Analytics",       url: "/dashboard/analytics",       icon: <ChartBarIcon /> },
    { title: "Settings",        url: "/dashboard/settings",        icon: <Settings2Icon /> },
  ],
  headmaster: [
    { title: "Dashboard",       url: "/dashboard",               icon: <LayoutDashboardIcon /> },
    { title: "Master Results",  url: "/dashboard/admin-results", icon: <TableIcon /> },
    { title: "Results (Slips)", url: "/dashboard/results",       icon: <ChartBarIcon /> },
    { title: "Analytics",       url: "/dashboard/analytics",     icon: <ChartBarIcon /> },
    { title: "Settings",        url: "/dashboard/settings",      icon: <Settings2Icon /> },
  ],
}

export const ROLE_LABEL: Record<Role, string> = {
  hod: "Head of Department",
  teacher: "Teacher",
  parent: "Parent",
  admin: "Admin",
  headmaster: "Headmaster",
}