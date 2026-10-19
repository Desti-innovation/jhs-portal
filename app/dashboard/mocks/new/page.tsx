"use client" // <-- Need this for hooks

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { createMockAction } from "../actions"

export default function NewMockPage() {
  const [state, formAction, pending] = useActionState(createMockAction, null)

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold">New Mock</h1>
      <p className="text-sm text-muted-foreground">
        Fill in the details. Status starts as <b>Draft</b>.
      </p>

      {/* Notice: action={formAction} instead of createMockAction */}
      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="Mock 1" required />
        </div>
        <div>
          <Label htmlFor="term">Term</Label>
          <Input id="term" name="term" placeholder="Term 1" required />
        </div>
        <div>
          <Label htmlFor="academic_year">Academic year</Label>
          <Input
            id="academic_year"
            name="academic_year"
            placeholder="2025/2026"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="opens_at">Opens at (optional)</Label>
            <Input id="opens_at" name="opens_at" type="datetime-local" />
          </div>
          <div>
            <Label htmlFor="closes_at">Closes at (optional)</Label>
            <Input id="closes_at" name="closes_at" type="datetime-local" />
          </div>
        </div>

        {state?.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/dashboard/mocks" />}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </div>
  )
}