"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { createMockAction } from "../actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeftIcon } from "lucide-react"

export default function NewMockPage() {
  const [state, formAction, pending] = useActionState(createMockAction, null)

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/dashboard/mocks" />}>
        <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Mocks
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create New Mock</CardTitle>
          <CardDescription>
            Fill in the details below. The status will start as <b>Draft</b>, meaning teachers cannot see it yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Mock Name</Label>
              <Input id="name" name="name" placeholder="e.g. Mock 1" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="term">Term</Label>
              <Input id="term" name="term" placeholder="e.g. Term 1" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="academic_year">Academic Year</Label>
              <Input
                id="academic_year"
                name="academic_year"
                placeholder="e.g. 2025/2026"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="opens_at">Opens at (optional)</Label>
                <Input id="opens_at" name="opens_at" type="datetime-local" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closes_at">Closes at (optional)</Label>
                <Input id="closes_at" name="closes_at" type="datetime-local" />
              </div>
            </div>

            {state?.error && (
              <p className="text-sm text-red-500 font-medium">{state.error}</p>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                nativeButton={false}
                render={<Link href="/dashboard/mocks" />}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Creating..." : "Create Mock"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}