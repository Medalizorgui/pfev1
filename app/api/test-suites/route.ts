import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')
    const includeChildren = searchParams.get('include_children') === 'true'

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      const query = includeChildren
        ? `SELECT * FROM test_suites 
           WHERE project_id = $1
           ORDER BY created_at DESC`
        : `SELECT * FROM test_suites 
           WHERE project_id = $1 AND parent_suite_id IS NULL
           ORDER BY created_at DESC`

      const result = await client.query(query, [projectId])

      return NextResponse.json(result.rows)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching test suites:', error)
    return NextResponse.json(
      { error: "Failed to fetch test suites" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { project_id, name, parent_suite_id, details } = body

    if (!project_id || !name) {
      return NextResponse.json(
        { error: "Project ID and name are required" },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      const result = await client.query(
        `INSERT INTO test_suites 
         (project_id, name, parent_suite_id, details, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING *`,
        [project_id, name, parent_suite_id || null, details || null]
      )

      return NextResponse.json(result.rows[0])
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error creating test suite:', error)
    return NextResponse.json(
      { error: "Failed to create test suite" },
      { status: 500 }
    )
  }
} 