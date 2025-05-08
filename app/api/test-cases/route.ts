import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET: Fetch test cases by test suite ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testSuiteId = searchParams.get('test_suite_id');

    if (!testSuiteId) {
      return NextResponse.json(
        { error: "test_suite_id is required" },
        { status: 400 }
      );
    }

    const query = `
      SELECT 
        tc.id,
        tc.user_story_id,
        tc.test_suite_id,
        tc.title,
        tc.summary,
        tc.precondition,
        tc.postcondition,
        tc.status,
        tc.manual_edit,
        tc.importance,
        tc.execution_type,
        tc.created_at,
        tc.updated_at
      FROM test_cases tc
      WHERE tc.test_suite_id = $1
      ORDER BY tc.id`;

    const testCasesResult = await pool.query(query, [testSuiteId]);
    const testCases = testCasesResult.rows;

    // Fetch test steps for each test case
    for (const testCase of testCases) {
      const stepsResult = await pool.query(`
        SELECT 
          id,
          test_case_id,
          step_number,
          step_action,
          expected_result,
          execution_type
        FROM test_steps
        WHERE test_case_id = $1
        ORDER BY step_number
      `, [testCase.id]);

      testCase.test_steps = stepsResult.rows;
    }

    return NextResponse.json(testCases);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch test cases" },
      { status: 500 }
    );
  }
}

// POST: Create a new test case
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      test_suite_id,
      title,
      summary,
      precondition,
      postcondition,
      status,
      manual_edit,
      importance,
      execution_type
    } = body;

    const query = `
      INSERT INTO test_cases (
        test_suite_id, title, summary, precondition, postcondition, status, manual_edit, importance, execution_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`;

    const values = [
      test_suite_id, title, summary, precondition, postcondition, status, manual_edit, importance, execution_type
    ];

    const result = await pool.query(query, values);
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to create test case" },
      { status: 500 }
    );
  }
} 