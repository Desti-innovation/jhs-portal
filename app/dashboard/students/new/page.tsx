"use client"

import { useActionState } from "react"
import Link from "next/link"
import { createStudentAction } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeftIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewStudentPage() {
  const [state, formAction, pending] = useActionState(createStudentAction, null)

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/dashboard/students" />}>
        <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Students
      </Button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Enroll New Student</h1>
        <p className="text-muted-foreground text-sm">
          Fill out the details below. The Index Number will be generated automatically.
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        
        {/* 1. Personal Details */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input id="first_name" name="first_name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input id="last_name" name="last_name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="middle_name">Middle Name</Label>
              <Input id="middle_name" name="middle_name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="other_name">Other Name</Label>
              <Input id="other_name" name="other_name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input id="date_of_birth" name="date_of_birth" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select 
                id="gender" 
                name="gender" 
                className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-background [&>option]:text-foreground"
              >
                <option value="" disabled>Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 2. Parent Details */}
        <Card>
          <CardHeader>
            <CardTitle>Parent/Guardian Details</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              * At least one phone number is required. Parents will use this number to log in.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="father_name">Father's Name</Label>
              <Input id="father_name" name="father_name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="father_phone">Father's Phone</Label>
              <Input id="father_phone" name="father_phone" type="tel" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mother_name">Mother's Name</Label>
              <Input id="mother_name" name="mother_name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mother_phone">Mother's Phone</Label>
              <Input id="mother_phone" name="mother_phone" type="tel" />
            </div>
          </CardContent>
        </Card>

        {/* 3. Photo Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Student Photo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="image">Passport Picture (JPG/PNG)</Label>
            <Input id="image" name="image" type="file" accept="image/png, image/jpeg" />
          </CardContent>
        </Card>

        {state?.error && (
          <p className="text-sm text-red-500 font-medium">{state.error}</p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" nativeButton={false} render={<Link href="/dashboard/students" />}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save Student"}
          </Button>
        </div>
      </form>
    </div>
  )
}