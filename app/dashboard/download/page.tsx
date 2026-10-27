import { requireRole } from "@/lib/auth"
import { sql } from "@/lib/db"
import { DownloadClient } from "./download-client"

export const instant = false

export default async function DownloadPage({
  searchParams,
}: {
  searchParams: Promise<{ mock?: string }>
}) {
  const user = await requireRole("parent")
  const { mock: mockId } = await searchParams

  // 👇 Log the view!
  if (user.role === "parent" && mockId) {
    const studentId = user.id.replace("parent-", "")
    try {
      await sql`
        INSERT INTO result_logs (student_id, mock_id, action)
        VALUES (${studentId}, ${mockId}, 'view')
      `
    } catch (e) {
      // Ignore if table doesn't exist or other issue
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-6 bg-muted/10">
      <DownloadClient mockId={mockId || ""} />
    </div>
  )
}