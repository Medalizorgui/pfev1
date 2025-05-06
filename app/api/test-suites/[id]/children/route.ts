import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const client = await pool.connect()
    try {
      const result = await client.query(
        `SELECT * FROM test_suites 
         WHERE parent_suite_id = $1
         ORDER BY created_at DESC`,
        [id]
      )

      return NextResponse.json(result.rows)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching child test suites:', error)
    return NextResponse.json(
      { error: "Failed to fetch child test suites" },
      { status: 500 }
    )
  }
} 