import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await pool.connect()
    try {
      const result = await client.query(
        `SELECT * FROM test_suite_configs
         WHERE test_suite_id = $1`,
        [params.id]
      )

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Test suite configuration not found" },
          { status: 404 }
        )
      }

      return NextResponse.json(result.rows[0])
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching test suite configuration:', error)
    return NextResponse.json(
      { error: "Failed to fetch test suite configuration" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { 
      test_framework,
      programming_language,
      test_runner,
      environment_variables,
      pre_test_scripts,
      post_test_scripts,
      timeout,
      retry_count,
      parallel_execution
    } = body

    const client = await pool.connect()
    try {
      // Check if configuration already exists
      const existingConfig = await client.query(
        `SELECT * FROM test_suite_configs
         WHERE test_suite_id = $1`,
        [params.id]
      )

      if (existingConfig.rows.length > 0) {
        return NextResponse.json(
          { error: "Configuration already exists for this test suite" },
          { status: 400 }
        )
      }

      const result = await client.query(
        `INSERT INTO test_suite_configs (
          test_suite_id,
          test_framework,
          programming_language,
          test_runner,
          environment_variables,
          pre_test_scripts,
          post_test_scripts,
          timeout,
          retry_count,
          parallel_execution
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          params.id,
          test_framework,
          programming_language,
          test_runner,
          environment_variables || {},
          pre_test_scripts || [],
          post_test_scripts || [],
          timeout || 300,
          retry_count || 0,
          parallel_execution || false
        ]
      )

      return NextResponse.json(result.rows[0])
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error creating test suite configuration:', error)
    return NextResponse.json(
      { error: "Failed to create test suite configuration" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { 
      test_framework,
      programming_language,
      test_runner,
      environment_variables,
      pre_test_scripts,
      post_test_scripts,
      timeout,
      retry_count,
      parallel_execution
    } = body

    const client = await pool.connect()
    try {
      const result = await client.query(
        `UPDATE test_suite_configs
         SET test_framework = $1,
             programming_language = $2,
             test_runner = $3,
             environment_variables = $4,
             pre_test_scripts = $5,
             post_test_scripts = $6,
             timeout = $7,
             retry_count = $8,
             parallel_execution = $9
         WHERE test_suite_id = $10
         RETURNING *`,
        [
          test_framework,
          programming_language,
          test_runner,
          environment_variables || {},
          pre_test_scripts || [],
          post_test_scripts || [],
          timeout || 300,
          retry_count || 0,
          parallel_execution || false,
          params.id
        ]
      )

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Test suite configuration not found" },
          { status: 404 }
        )
      }

      return NextResponse.json(result.rows[0])
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error updating test suite configuration:', error)
    return NextResponse.json(
      { error: "Failed to update test suite configuration" },
      { status: 500 }
    )
  }
} 