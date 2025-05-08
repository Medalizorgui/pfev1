import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db'; // Adjust the import path as necessary

// GET: Fetch a single test case
export async function GET(
  request: NextRequest,
  { params }: { params: { testCaseId: string } }
) {
  try {
    const testCaseId = params.testCaseId;

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
      WHERE tc.id = $1`;

    const result = await pool.query(query, [testCaseId]);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Test case not found" },
        { status: 404 }
      );
    }

    const testCase = result.rows[0];

    // Fetch test steps
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
    `, [testCaseId]);

    testCase.test_steps = stepsResult.rows;

    return NextResponse.json(testCase);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch test case" },
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

// PUT: Update an existing test case
export async function PUT(
  request: NextRequest,
  { params }: { params: { testCaseId: string } }
) {
  try {
    const testCaseId = params.testCaseId;
    const body = await request.json();
    
    const {
      title,
      summary,
      precondition = null,
      postcondition = null,
      status = 'Not Run',
      manual_edit = false,
      importance = 'Medium',
      execution_type = 'Manual'
    } = body;

    // Log the details for debugging
    console.log("Update API called with testCaseId:", testCaseId);
    console.log("Update payload:", body);

    // Validate the ID before updating
    const idCheckQuery = `SELECT id FROM test_cases WHERE id = $1`;
    const idCheckResult = await pool.query(idCheckQuery, [testCaseId]);

    if (idCheckResult.rowCount === 0) {
      return NextResponse.json(
        { error: "Test case with the provided ID does not exist" },
        { status: 404 }
      );
    }

    const query = `
      UPDATE test_cases
      SET 
        title = $1,
        summary = $2,
        precondition = $3,
        postcondition = $4,
        status = $5,
        manual_edit = $6,
        importance = $7,
        execution_type = $8,
        updated_at = NOW()
      WHERE id = $9
      RETURNING *`;

    const values = [
      title, 
      summary, 
      precondition, 
      postcondition, 
      status, 
      manual_edit, 
      importance, 
      execution_type, 
      testCaseId
    ];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Failed to update test case" },
        { status: 500 }
      );
    }

    // After update, fetch the test steps to include in the response
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
    `, [testCaseId]);

    const updatedTestCase = result.rows[0];
    updatedTestCase.test_steps = stepsResult.rows;

    console.log("Successfully updated test case, returning:", updatedTestCase);
    return NextResponse.json(updatedTestCase);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to update test case" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a test case
export async function DELETE(
  request: NextRequest,
  { params }: { params: { testCaseId: string } }
) {
  try {
    const testCaseId = params.testCaseId;
    
    console.log("Delete API called with testCaseId:", testCaseId);

    // First delete any associated test steps
    await pool.query(`DELETE FROM test_steps WHERE test_case_id = $1`, [testCaseId]);
    
    // Then delete the test case
    const query = `
      DELETE FROM test_cases
      WHERE id = $1
      RETURNING *`;

    const result = await pool.query(query, [testCaseId]);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Test case not found" },
        { status: 404 }
      );
    }

    console.log("Successfully deleted test case with ID:", testCaseId);
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to delete test case" },
      { status: 500 }
    );
  }
}