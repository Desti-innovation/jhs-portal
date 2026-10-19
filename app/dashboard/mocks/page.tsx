import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { listMocks } from "@/lib/mocks"
import { MockStatusBadge } from "@/components/mock-status-badge"

export default function MocksPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mocks</h1>
          <p className="text-sm text-muted-foreground">
            Create, activate and publish mock exams.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/dashboard/mocks/new" />}>
          <PlusIcon /> New Mock
        </Button>
      </div>

      <Suspense fallback={<MocksSkeleton />}>
        <MocksList />
      </Suspense>
    </div>
  )
}

async function MocksList() {
  const mocks = await listMocks()
  return (
    <div className="mt-6 rounded-md border">
      {mocks.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted-foreground">
          No mocks yet. Create your first one.
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr className="text-left">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Term</th>
              <th className="px-4 py-2">Year</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {mocks.map((m) => (
              <tr key={m.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{m.name}</td>
                <td className="px-4 py-3">{m.term}</td>
                <td className="px-4 py-3">{m.academic_year}</td>
                <td className="px-4 py-3">
                  <MockStatusBadge status={m.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    nativeButton={false}
                    render={<Link href={`/dashboard/mocks/${m.id}`} />}
                  >
                    Open
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function MocksSkeleton() {
  return (
    <div className="mt-6 rounded-md border">
      <div className="p-10 text-center text-sm text-muted-foreground">
        Loading mocks…
      </div>
    </div>
  )
}