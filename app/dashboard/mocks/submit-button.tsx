"use client"

import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function SubmitButton({ 
  label, 
  variant = "default" 
}: { 
  label: string
  variant?: "default" | "destructive" 
}) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" variant={variant} disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? "Updating..." : label}
    </Button>
  )
}