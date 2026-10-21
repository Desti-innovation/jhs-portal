"use client"

import { useState } from "react"
import { assignTeacherAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function AssignTeacherForm({ 
  subjectId, 
  teachers 
}: { 
  subjectId: string
  teachers: { id: string, name: string, email: string }[] 
}) {
  const [teacherId, setTeacherId] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAssign = async () => {
    if (!teacherId) return
    setLoading(true)
    await assignTeacherAction(subjectId, teacherId)
    setLoading(false)
    setTeacherId("") // Reset
  }

  return (
    <div className="flex items-center gap-2">
      <select 
        value={teacherId} 
        onChange={(e) => setTeacherId(e.target.value)}
        className="flex h-9 w-full sm:w-[200px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring [&>option]:bg-background [&>option]:text-foreground"
      >
        <option value="" disabled>Assign a teacher...</option>
        {teachers.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
      <Button size="sm" onClick={handleAssign} disabled={!teacherId || loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign"}
      </Button>
    </div>
  )
}