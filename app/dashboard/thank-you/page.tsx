import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Download, ArrowLeft } from "lucide-react"

export const instant = false

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ mock?: string }>
}) {
  const { mock: mockId } = await searchParams

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-6 bg-muted/10">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 mb-4 dark:bg-emerald-900/30">
            <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle className="text-2xl">Thank You!</CardTitle>
          <p className="text-muted-foreground mt-2 text-balance">
            Your generous donation helps us keep the Destora Portal running. We truly appreciate your support.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <Button className="w-full" nativeButton={false} render={<Link href={`/dashboard/results?mock=${mockId}`} />}>
            <Download className="mr-2 h-4 w-4" /> Go to Download Page
          </Button>
          <Button variant="ghost" className="w-full" nativeButton={false} render={<Link href="/dashboard" />}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}