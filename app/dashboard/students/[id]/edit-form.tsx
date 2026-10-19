"use client"

import { useActionState } from "react"
import Link from "next/link"
import { updateStudentAction } from "../actions" // 👈 Fixed import path
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function EditStudentForm({ student }: { student: any }) {
  // Bind the student's ID to the action
  const updateAction = updateStudentAction.bind(null, student.id)
  
  // 👈 Explicitly type the state so TypeScript knows it has an 'error' property
  const [state, formAction, pending] = useActionState<{ error?: string } | null, FormData>(updateAction, null)

  return (
    <form action={formAction} className="space-y-6">
      
      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">First Name *</Label>
            <Input id="first_name" name="first_name" defaultValue={student.first_name} required />
          </div>
          <div>
            <Label htmlFor="last_name">Last Name *</Label>
            <Input id="last_name" name="last_name" defaultValue={student.last_name} required />
          </div>
          <div>
            <Label htmlFor="middle_name">Middle Name</Label>
            <Input id="middle_name" name="middle_name" defaultValue={student.middle_name ?? ""} />
          </div>
          <div>
            <Label htmlFor="other_name">Other Name</Label>
            <Input id="other_name" name="other_name" defaultValue={student.other_name ?? ""} />
          </div>
          <div>
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input 
              id="date_of_birth" 
              name="date_of_birth" 
              type="date" 
              defaultValue={student.date_of_birth ? new Date(student.date_of_birth).toISOString().split('T')[0] : ""} 
            />
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <select 
              id="gender" 
              name="gender" 
              defaultValue={student.gender ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parent/Guardian Details</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            * At least one phone number is required.
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="father_name">Father's Name</Label>
            <Input id="father_name" name="father_name" defaultValue={student.father_name ?? ""} />
          </div>
          <div>
            <Label htmlFor="father_phone">Father's Phone</Label>
            <Input id="father_phone" name="father_phone" type="tel" defaultValue={student.father_phone ?? ""} />
          </div>
          <div>
            <Label htmlFor="mother_name">Mother's Name</Label>
            <Input id="mother_name" name="mother_name" defaultValue={student.mother_name ?? ""} />
          </div>
          <div>
            <Label htmlFor="mother_phone">Mother's Phone</Label>
            <Input id="mother_phone" name="mother_phone" type="tel" defaultValue={student.mother_phone ?? ""} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Photo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {student.image_url && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Current Photo:</p>
              <img src={student.image_url} alt="Current" className="h-[120px] object-contain border rounded" />
            </div>
          )}
          <div>
            <Label htmlFor="image">Upload New Photo (Optional)</Label>
            <Input id="image" name="image" type="file" accept="image/png, image/jpeg" />
            <input type="hidden" name="existing_image" value={student.image_url ?? ""} />
          </div>
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
          {pending ? "Updating..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}