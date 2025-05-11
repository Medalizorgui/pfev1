import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import ExcelJS from 'exceljs'
import { QueryConfig } from 'pg'

interface TestStep {
  step_number: number
  step_action: string
  expected_result: string
  execution_type: string
}

interface TestCase {
  id: number
  title: string
  summary: string
  precondition: string
  execution_type: string
  importance: string
  steps: TestStep[]
}

export async function POST(request: NextRequest) {
  try {
    const { test_suite_id } = await request.json()

    if (!test_suite_id) {
      return NextResponse.json(
        { error: 'test_suite_id is required' },
        { status: 400 }
      )
    }

    // Fetch test cases and their steps from the database
    const testCasesQuery = `
      SELECT tc.id, tc.title, tc.summary, tc.precondition, tc.execution_type, tc.importance,
             ts.step_number, ts.step_action, ts.expected_result, ts.execution_type as step_execution_type
      FROM test_cases tc
      LEFT JOIN test_steps ts ON tc.id = ts.test_case_id
      WHERE tc.test_suite_id = $1
      ORDER BY tc.id, ts.step_number
    `

    const result = await pool.query(testCasesQuery, [test_suite_id])
    
    // Group test cases and their steps
    const testCases = new Map<number, TestCase>()
    result.rows.forEach(row => {
      if (!testCases.has(row.id)) {
        testCases.set(row.id, {
          id: row.id,
          title: row.title,
          summary: row.summary,
          precondition: row.precondition,
          execution_type: row.execution_type,
          importance: row.importance,
          steps: []
        })
      }
      
      if (row.step_number) {
        testCases.get(row.id)?.steps.push({
          step_number: row.step_number,
          step_action: row.step_action,
          expected_result: row.expected_result,
          execution_type: row.step_execution_type
        })
      }
    })

    // Create a new Excel workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Test Cases')

    // Set up headers
    worksheet.columns = [
      { header: 'Testrail I+A1:I104D', key: 'id', width: 15 },
      { header: 'Section', key: 'section', width: 30 },
      { header: 'Sub-Section', key: 'subsection', width: 30 },
      { header: 'Test case title', key: 'title', width: 40 },
      { header: 'Preconditions', key: 'preconditions', width: 40 },
      { header: 'Steps', key: 'steps', width: 40 },
      { header: 'Expected Results', key: 'expected_results', width: 40 },
      { header: 'Result (OK / KO)', key: 'result', width: 15 },
      { header: 'Bug description', key: 'bug_description', width: 30 },
      { header: 'Click up Link', key: 'clickup_link', width: 30 }
    ]

    // Style the header row
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }

    // Add test cases to the worksheet
    testCases.forEach(testCase => {
      // Format steps and expected results
      const steps = testCase.steps.map(step => 
        `${step.step_number}. ${step.step_action}`
      ).join('\n')
      
      const expectedResults = testCase.steps.map(step => 
        `${step.step_number}. ${step.expected_result}`
      ).join('\n')

      worksheet.addRow({
        id: `C${testCase.id}`,
        section: 'Orders management > Middlewares > PO creation for Axya Whisper',
        subsection: 'PO creation for Axya Whisper',
        title: testCase.title,
        preconditions: testCase.precondition,
        steps: steps,
        expected_results: expectedResults,
        result: '',
        bug_description: '',
        clickup_link: ''
      })
    })

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer()

    // Store the Excel file in the database
    const insertQuery = `
      INSERT INTO testlink_exports (test_suite_id, xml_file, excel_file_path)
      VALUES ($1, '', $2)
      RETURNING id, test_suite_id, xml_file, excel_file_path, created_at
    `

    const insertResult = await pool.query(insertQuery, [test_suite_id, buffer.toString('base64')])
    return NextResponse.json(insertResult.rows[0])
  } catch (error) {
    console.error('Error generating Excel:', error)
    return NextResponse.json(
      { error: 'Failed to generate Excel', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 