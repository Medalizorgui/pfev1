import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// POST: Create a new test step
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      test_case_id,
      step_number,
      step_action,
      expected_result,
      execution_type
    } = body;

    const query = `
      INSERT INTO test_steps (
        test_case_id, step_number, step_action, expected_result, execution_type
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`;

    const values = [
      test_case_id, step_number, step_action, expected_result, execution_type
    ];

    const result = await pool.query(query, values);
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to create test step" },
      { status: 500 }
    );
  }
} 