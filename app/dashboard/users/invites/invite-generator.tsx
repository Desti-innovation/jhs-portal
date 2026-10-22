"use client"

import { useState } from "react"
import { generateInviteAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, LinkIcon, Check } from "lucide-react"

// 👇 Force the production domain
const PRODUCTION_URL = "https://destora.cignalpulse.com"

export function InviteGenerator() {
  const [role, setRole] = useState("teacher")
  const [loading, setLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    setCopied(false)
    const res = await generateInviteAction(role)
    if (res.success && res.token) {
      // 👇 Use the production URL instead of window.location.origin
      setGeneratedLink(`${PRODUCTION_URL}/invite/${res.token}`)
    } else {
      alert(res.error)
    }
    setLoading(false)
  }

  const copyToClipboard = () => {
    if (!generatedLink) return
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate New Link</CardTitle>
        <CardDescription>Links expire after 24 hours and can only be used once.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Role to Assign</Label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring [&>option]:bg-background [&>option]:text-foreground"
          >
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
            <option value="headmaster">Headmaster</option>
          </select>
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
          Generate Link
        </Button>

        {generatedLink && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md space-y-2">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Link generated successfully:</p>
            <div className="flex items-center gap-2">
              <input 
                readOnly 
                value={generatedLink} 
                className="flex-1 bg-background text-xs p-2 rounded border border-input"
              />
              <Button size="sm" variant="secondary" onClick={copyToClipboard}>
                {copied ? <Check className="h-4 w-4" /> : "Copy"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}