import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import { getMock } from "@/lib/mocks"
import { MockStatusBadge } from "@/components/mock-status-badge"
import { transitionMockAction } from "../actions"
import { SubmitButton } from "./submit-button"

export const instant = false

export default async function MockDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const mock = await getMock(id)
  if (!mock) notFound()

  const next: {
    label: string
    action: string
    variant?: "default" | "destructive"
  }[] = []
  if (mock.status === "draft")
    next.push({ label: "Activate", action: "activate" })
  if (mock.status === "active")
    next.push({ label: "Lock", action: "lock" })
  if (mock.status === "locked")
    next.push({ label: "Publish", action: "publish" })
  if (mock.status !== "draft")
    next.push({ label: "Reopen", action: "reopen", variant: "destructive" })

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href="/dashboard/mocks" />}
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Mocks
      </Button>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{mock.name}</h1>
          <p className="text-muted-foreground mt-1">
            {mock.term} · {mock.academic_year}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MockStatusBadge status={mock.status} />
          
          {next.map((n) => (
            <form
              key={n.action}
              action={async () => {
                "use server"
                // We call the action inside a wrapper so it returns void
                await transitionMockAction(mock.id, n.action)
              }}
            >
              <SubmitButton label={n.label} variant={n.variant} />
            </form>
          ))}
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <Info label="Created" value={mock.created_at} />
        <Info label="Activated" value={mock.activated_at} />
        <Info label="Locked" value={mock.locked_at} />
        <Info label="Published" value={mock.published_at} />
        <Info label="Opens at" value={mock.opens_at} />
        <Info label="Closes at" value={mock.closes_at} />
      </dl>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-md border p-4 bg-card">
      <dt className="text-xs uppercase font-bold text-muted-foreground mb-1">{label}</dt>
      <dd className="font-medium">{value ? new Date(value).toLocaleString() : "—"}</dd>
    </div>
  )
}