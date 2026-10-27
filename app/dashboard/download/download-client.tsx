"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Heart, Download, ArrowLeft } from "lucide-react"

export function DownloadClient({ mockId }: { mockId: string }) {
  const [amount, setAmount] = useState("5")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFreeDownload = () => {
    window.location.href = `/dashboard/results?mock=${mockId}`
  }

  const handleDonate = async () => {
    const numericAmount = Number(amount)
    if (isNaN(numericAmount) || numericAmount < 1) {
      setError("Please enter an amount of at least GHS 1.00")
      return
    }

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address to receive your receipt.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/paystack", {
        method: "POST",
        body: JSON.stringify({ mockId, amount: numericAmount, email }), 
      })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url 
      } else {
        throw new Error(data.error || "Payment initialization failed")
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg border-0 ring-1 ring-border">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Heart className="size-7 text-primary" />
        </div>
        <CardTitle className="text-2xl">Download Result</CardTitle>
        <CardDescription className="text-balance mt-2">
          You can download your official PDF for free. If you find this portal helpful, please consider a small donation to help us cover our hosting costs so we can keep the service running.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-4">
        
        <Button onClick={handleFreeDownload} className="w-full h-12 text-base" variant="default">
          <Download className="mr-2 h-5 w-5" /> Download for Free
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or support us</span>
          </div>
        </div>

        <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
          <p className="text-sm font-medium text-center">Help us keep the portal alive</p>
          
          <div className="space-y-2">
            <label className="text-xs font-medium">Your Email (for receipt)</label>
            <Input 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">GHS</span>
              <Input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-12" />
            </div>
            <Button onClick={handleDonate} disabled={loading} variant="secondary">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Donate"}
            </Button>
          </div>
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        </div>
        
        <Button variant="ghost" className="w-full" nativeButton={false} render={<Link href="/dashboard" />}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </CardContent>
    </Card>
  )
}