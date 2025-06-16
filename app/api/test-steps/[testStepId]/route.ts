import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET: Fetch a single test step
export async function GET(
  request: NextRequest,
  context: { params: { testStepId: string } }
) {
  try {
    const testStepId = context.params.testStepId;
    const query = `
      SELECT 
        id,
        test_case_id,
        step_number,
        step_action,
        expected_result,
        execution_type
      FROM test_steps
      WHERE id = $1`;

    const result = await pool.query(query, [testStepId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Test step not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch test step" },
      { status: 500 }
    );
  }
}

// PUT: Update a test step
export async function PUT(
  request: NextRequest,
  context: { params: { testStepId: string } }
) {
  try {
    const testStepId = context.params.testStepId;
    const body = await request.json();
    const {
      step_number,
      step_action,
      expected_result,
      execution_type
    } = body;

    // First check if the test step exists
    const checkQuery = "SELECT id FROM test_steps WHERE id = $1";
    const checkResult = await pool.query(checkQuery, [testStepId]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Test step not found" },
        { status: 404 }
      );
    }

    const query = `
      UPDATE test_steps
      SET 
        step_number = $1,
        step_action = $2,
        expected_result = $3,
        execution_type = $4
      WHERE id = $5
      RETURNING *`;

    const values = [
      step_number,
      step_action,
      expected_result,
      execution_type,
      testStepId
    ];

    const result = await pool.query(query, values);
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to update test step" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a test step
export async function DELETE(
  request: NextRequest,
  context: { params: { testStepId: string } }
) {
  try {
    const testStepId = context.params.testStepId;

    // First check if the test step exists
    const checkQuery = "SELECT id FROM test_steps WHERE id = $1";
    const checkResult = await pool.query(checkQuery, [testStepId]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Test step not found" },
        { status: 404 }
      );
    }

    const query = "DELETE FROM test_steps WHERE id = $1";
    await pool.query(query, [testStepId]);

    return NextResponse.json({ message: "Test step deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to delete test step" },
      { status: 500 }
    );
  }
} 