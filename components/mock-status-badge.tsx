import { Badge } from "@/components/ui/badge"
import type { MockStatus } from "@/lib/mocks"

const STYLES: Record<MockStatus, { label: string; className: string }> = {
  draft:     { label: "Draft",     className: "bg-slate-500 text-white" },
  active:    { label: "Active",    className: "bg-blue-600 text-white" },
  locked:    { label: "Locked",    className: "bg-amber-500 text-white" },
  published: { label: "Published", className: "bg-emerald-600 text-white" },
}

export function MockStatusBadge({ status }: { status: MockStatus }) {
  const s = STYLES[status]
  return <Badge className={s.className}>{s.label}</Badge>
}