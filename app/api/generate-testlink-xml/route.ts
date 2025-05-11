import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { testSuiteId } = await request.json()

    if (!testSuiteId) {
      return NextResponse.json(
        { error: 'test_suite_id is required' },
        { status: 400 }
      )
    }

    // Fetch test cases and their steps from the database
    const testCasesQuery = `
      SELECT tc.id, tc.name, tc.summary, tc.preconditions, tc.execution_type, tc.importance,
             ts.step_number, ts.actions, ts.expected_results, ts.execution_type as step_execution_type
      FROM test_cases tc
      LEFT JOIN test_steps ts ON tc.id = ts.test_case_id
      WHERE tc.test_suite_id = $1
      ORDER BY tc.id, ts.step_number
    `

    const result = await pool.query(testCasesQuery, [testSuiteId])
    
    // Group test cases and their steps
    const testCases = new Map()
    result.rows.forEach(row => {
      if (!testCases.has(row.id)) {
        testCases.set(row.id, {
          id: row.id,
          name: row.name,
          summary: row.summary,
          preconditions: row.preconditions,
          execution_type: row.execution_type,
          importance: row.importance,
          steps: []
        })
      }
      
      if (row.step_number) {
        testCases.get(row.id).steps.push({
          step_number: row.step_number,
          actions: row.actions,
          expected_results: row.expected_results,
          execution_type: row.step_execution_type
        })
      }
    })

    // Generate XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<testsuite name="Test Suite">\n\n'
    xml += '  <details>\n'
    xml += '    This test suite contains automated test cases.\n'
    xml += '  </details>\n\n'

    testCases.forEach(testCase => {
      xml += `  <testcase name="${escapeXml(testCase.name)}" internalid="${testCase.id}" version="1"\n`
      xml += `            summary="${escapeXml(testCase.summary)}"\n`
      xml += `            execution_type="${testCase.execution_type}" importance="${testCase.importance}">\n\n`
      
      if (testCase.preconditions) {
        xml += '    <preconditions>\n'
        xml += `      ${escapeXml(testCase.preconditions)}\n`
        xml += '    </preconditions>\n\n'
      }

      if (testCase.steps.length > 0) {
        xml += '    <steps>\n'
        testCase.steps.forEach(step => {
          xml += '      <step>\n'
          xml += `        <step_number>${step.step_number}</step_number>\n`
          xml += `        <actions>${escapeXml(step.actions)}</actions>\n`
          xml += `        <expectedresults>${escapeXml(step.expected_results)}</expectedresults>\n`
          xml += `        <execution_type>${step.execution_type}</execution_type>\n`
          xml += '      </step>\n'
        })
        xml += '    </steps>\n\n'
      }

      xml += '  </testcase>\n\n'
    })

    xml += '</testsuite>'

    // Store the XML in the database
    const insertQuery = `
      INSERT INTO testlink_exports (test_suite_id, xml_file)
      VALUES ($1, $2)
      RETURNING id, test_suite_id, xml_file, created_at
    `

    const insertResult = await pool.query(insertQuery, [testSuiteId, xml])
    
    return NextResponse.json(insertResult.rows[0])
  } catch (error) {
    console.error('Error generating XML:', error)
    return NextResponse.json(
      { error: 'Failed to generate XML', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
} 