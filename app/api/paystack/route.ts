import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "parent") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 👈 Get the email from the request body
    const { mockId, amount, email } = await req.json()
    
    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Amount must be at least GHS 1.00" }, { status: 400 })
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.error("PAYSTACK_SECRET_KEY is missing in .env.local")
      return NextResponse.json({ error: "Payment not configured" }, { status: 500 })
    }

    const studentId = user.id.replace("parent-", "")
    const reference = `DON_${studentId.slice(0,6)}_${Date.now()}`

    await sql`
      INSERT INTO download_payments (student_id, mock_id, reference, amount_paid, status)
      VALUES (${studentId}, ${mockId}, ${reference}, ${amount}, 'pending')
    `

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email, // 👈 Use the typed email here
        amount: Math.round(amount * 100),
        reference: reference,
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/paystack/callback?mock=${mockId}`,
      }),
    })

    const data = await res.json()

    if (!data.status) {
      console.error("PAYSTACK ERROR:", JSON.stringify(data, null, 2))
      return NextResponse.json({ error: data.message || "Failed to initialize payment" }, { status: 500 })
    }

    return NextResponse.json({ url: data.data.authorization_url })
  } catch (error) {
    console.error("PAYSTACK ROUTE CRASH:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}