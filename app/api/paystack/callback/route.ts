import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const reference = searchParams.get("reference")
  const mockId = searchParams.get("mock")

  const user = await getCurrentUser()
  if (!user) return NextResponse.redirect(new URL("/login", req.url))

  if (!reference) {
    return NextResponse.redirect(new URL(`/dashboard/download?mock=${mockId}&error=Invalid reference`, req.url))
  }

  try {
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    })
    
    const verifyData = await verifyRes.json()

    if (verifyData.status && verifyData.data && verifyData.data.status === "success") {
      await sql`
        UPDATE download_payments 
        SET status = 'success' 
        WHERE reference = ${reference}
      `
      return NextResponse.redirect(new URL(`/dashboard/thank-you?mock=${mockId}`, req.url))
    }

    return NextResponse.redirect(new URL(`/dashboard/download?mock=${mockId}&error=Payment failed`, req.url))
  } catch (error) {
    return NextResponse.redirect(new URL(`/dashboard/download?mock=${mockId}&error=Verification failed`, req.url))
  }
}