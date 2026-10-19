import { sql } from "@/lib/db"

export type MockStatus = "draft" | "active" | "locked" | "published"

export type Mock = {
  id: string
  name: string
  term: string
  academic_year: string
  status: MockStatus
  opens_at: string | null
  closes_at: string | null
  created_by: string
  activated_at: string | null
  locked_at: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export async function listMocks(): Promise<Mock[]> {
  return (await sql`
    SELECT *
    FROM mocks
    ORDER BY created_at DESC
  `) as Mock[]
}

export async function getMock(id: string): Promise<Mock | null> {
  const rows = (await sql`SELECT * FROM mocks WHERE id = ${id}`) as Mock[]
  return rows[0] ?? null
}

export async function createMock(input: {
  name: string
  term: string
  academic_year: string
  opens_at?: string | null
  closes_at?: string | null
  created_by: string
}): Promise<Mock> {
  const rows = (await sql`
    INSERT INTO mocks (name, term, academic_year, opens_at, closes_at, created_by)
    VALUES (
      ${input.name},
      ${input.term},
      ${input.academic_year},
      ${input.opens_at ?? null},
      ${input.closes_at ?? null},
      ${input.created_by}
    )
    RETURNING *
  `) as Mock[]
  return rows[0]
}

// Valid transitions:
//   draft     → active    (activate)
//   active    → locked    (lock)
//   locked    → published (publish)
//   *         → draft      (reopen, HOD only)
export async function transitionMock(
  id: string,
  action: "activate" | "lock" | "publish" | "reopen"
): Promise<Mock> {
  const current = await getMock(id)
  if (!current) throw new Error("Mock not found")

  if (action === "activate" && current.status !== "draft") {
    throw new Error("Only draft mocks can be activated")
  }
  if (action === "lock" && current.status !== "active") {
    throw new Error("Only active mocks can be locked")
  }
  if (action === "publish" && current.status !== "locked") {
    throw new Error("Only locked mocks can be published")
  }

  let rows: Mock[]
  if (action === "activate") {
    rows = (await sql`
      UPDATE mocks
         SET status = 'active', activated_at = now(), updated_at = now()
       WHERE id = ${id}
       RETURNING *
    `) as Mock[]
  } else if (action === "lock") {
    rows = (await sql`
      UPDATE mocks
         SET status = 'locked', locked_at = now(), updated_at = now()
       WHERE id = ${id}
       RETURNING *
    `) as Mock[]
  } else if (action === "publish") {
    rows = (await sql`
      UPDATE mocks
         SET status = 'published', published_at = now(), updated_at = now()
       WHERE id = ${id}
       RETURNING *
    `) as Mock[]
  } else {
    // reopen
    rows = (await sql`
      UPDATE mocks
         SET status = 'draft',
             activated_at = NULL, locked_at = NULL, published_at = NULL,
             updated_at = now()
       WHERE id = ${id}
       RETURNING *
    `) as Mock[]
  }
  return rows[0]
}