import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import bcrypt from "bcryptjs"
import { neon } from "@neondatabase/serverless"

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL missing — is .env.local present?")
  }

  const sql = neon(process.env.DATABASE_URL)
  const hash = await bcrypt.hash("ChangeMe123!", 10)

  await sql`
    INSERT INTO users (name, email, password_hash, role)
    VALUES ('Destiny HOD', 'hod@example.com', ${hash}, 'hod')
    ON CONFLICT (email) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          role = 'hod',
          is_active = TRUE
  `

  console.log("✅ HOD updated: hod@example.com / ChangeMe123!")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})