import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST() {
  try {
    // Insert a new row into the page_visits table
    await sql`INSERT INTO page_visits DEFAULT VALUES`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to track visit", error)
    return NextResponse.json({ error: "Failed to track" }, { status: 500 })
  }
}