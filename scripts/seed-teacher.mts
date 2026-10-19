import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import bcrypt from "bcryptjs"
import { neon } from "@neondatabase/serverless"

async function main() {
  const sql = neon(process.env.DATABASE_URL!)
  const hash = await bcrypt.hash("Teacher123!", 10)

  // 1) Create the teacher if missing
  const rows = (await sql`
    INSERT INTO users (name, email, password_hash, role)
    VALUES ('Mr. Mensah', 'mensah@example.com', ${hash}, 'teacher')
    ON CONFLICT (email) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          role = 'teacher',
          is_active = TRUE
    RETURNING id
  `) as { id: string }[]

  const teacherId = rows[0].id

  // 2) Assign teacher to MTH only (so we can prove they can't touch ENG)
  await sql`
    INSERT INTO teacher_assignments (teacher_id, subject_id)
    SELECT ${teacherId}, id FROM subjects WHERE code = 'MTH'
    ON CONFLICT (teacher_id, subject_id) DO NOTHING
  `

  console.log("✅ Teacher ready: mensah@example.com / Teacher123!")
  console.log("   Assigned: MTH only")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})