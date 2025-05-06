import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')

    const client = await pool.connect()
    try {
      let query = 'SELECT * FROM user_stories'
      let params: string[] = []
      
      if (projectId) {
        query += ' WHERE project_id = $1'
        params = [projectId]
      }
      
      query += ' ORDER BY created_at DESC'
      
      const result = await client.query(query, params)
      return NextResponse.json(result.rows)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching user stories:', error)
    return NextResponse.json(
      { error: "Failed to fetch user stories" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { project_id, title, description, acceptance_criteria, business_rules, status } = body

    // Validate required fields
    if (!project_id || !title || !description) {
      return NextResponse.json(
        { error: "Project ID, title, and description are required" },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      const result = await client.query(
        `INSERT INTO user_stories 
         (project_id, title, description, acceptance_criteria, business_rules, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING *`,
        [project_id, title, description, acceptance_criteria, business_rules, status || 'draft']
      )

      return NextResponse.json(result.rows[0])
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error creating user story:', error)
    return NextResponse.json(
      { error: "Failed to create user story" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, title, description, acceptance_criteria, business_rules, status } = body

    // Validate required fields
    if (!id || !title || !description) {
      return NextResponse.json(
        { error: "ID, title, and description are required" },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      const result = await client.query(
        `UPDATE user_stories 
         SET title = $1, 
             description = $2, 
             acceptance_criteria = $3, 
             business_rules = $4, 
             status = $5,
             updated_at = NOW()
         WHERE id = $6
         RETURNING *`,
        [title, description, acceptance_criteria, business_rules, status || 'draft', id]
      )

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "User story not found" },
          { status: 404 }
        )
      }

      return NextResponse.json(result.rows[0])
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error updating user story:', error)
    return NextResponse.json(
      { error: "Failed to update user story" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: "User story ID is required" },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      const result = await client.query(
        'DELETE FROM user_stories WHERE id = $1 RETURNING *',
        [id]
      )

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "User story not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error deleting user story:', error)
    return NextResponse.json(
      { error: "Failed to delete user story" },
      { status: 500 }
    )
  }
} 