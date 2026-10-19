import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import { getMock } from "@/lib/mocks"
import { MockStatusBadge } from "@/components/mock-status-badge"
import { transitionMockAction } from "../actions"

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
    <div className="p-6">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href="/dashboard/mocks" />}
      >
        <ArrowLeftIcon /> Back
      </Button>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{mock.name}</h1>
          <p className="text-sm text-muted-foreground">
            {mock.term} • {mock.academic_year}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MockStatusBadge status={mock.status} />
          {next.map((n) => (
            <form
              key={n.action}
              action={async () => {
                "use server"
                await transitionMockAction(mock.id, n.action)
              }}
            >
              <Button type="submit" variant={n.variant ?? "default"}>
                {n.label}
              </Button>
            </form>
          ))}
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
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
    <div>
      <dt className="text-xs uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-0.5">{value ? new Date(value).toLocaleString() : "—"}</dd>
    </div>
  )
}