import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  console.log('API route called')
  try {
    const { searchParams } = new URL(request.url)
    const testSuiteId = searchParams.get('test_suite_id')
    console.log('Received test_suite_id:', testSuiteId)

    if (!testSuiteId) {
      console.log('No test_suite_id provided')
      return NextResponse.json(
        { error: 'test_suite_id is required' },
        { status: 400 }
      )
    }

    // Test database connection
    try {
      await pool.query('SELECT NOW()')
      console.log('Database connection successful')
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      return NextResponse.json(
        { error: 'Database connection failed', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 500 }
      )
    }

    const query = `
      SELECT id, test_suite_id, xml_file, excel_file_path, created_at
      FROM testlink_exports
      WHERE test_suite_id = $1
      ORDER BY created_at DESC
    `
    console.log('Executing query with test_suite_id:', testSuiteId)

    const result = await pool.query(query, [testSuiteId])
    console.log('Query result:', result.rows)

    if (result.rows.length === 0) {
      console.log('No exports found for test suite:', testSuiteId)
      return NextResponse.json([], { status: 200 })
    }

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error in API route:', error)
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Failed to fetch testlink exports', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 