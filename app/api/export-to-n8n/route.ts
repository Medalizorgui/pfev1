import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

async function getTestSuiteInfo(testSuiteId: string) {
  const query = `
    SELECT 
      ts.id as test_suite_id,
      ts.name as test_suite_name,
      p.id as project_id,
      p.name as project_name
    FROM test_suites ts
    JOIN projects p ON ts.project_id = p.id
    WHERE ts.id = $1
  `;
  
  const result = await pool.query(query, [testSuiteId]);
  return result.rows[0];
}

function generateXML(data: any, suiteInfo: any) {
  const { test_cases } = data;
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<testcases>\n';
  xml += `  <project_id>${suiteInfo.project_id}</project_id>\n`;
  xml += `  <project_name>${escapeXML(suiteInfo.project_name)}</project_name>\n`;
  xml += `  <test_suite_id>${suiteInfo.test_suite_id}</test_suite_id>\n`;
  xml += `  <test_suite_name>${escapeXML(suiteInfo.test_suite_name)}</test_suite_name>\n`;
  
  test_cases.forEach((testCase: any) => {
    xml += '  <testcase>\n';
    xml += `    <id>${testCase.id}</id>\n`;
    xml += `    <title>${escapeXML(testCase.title)}</title>\n`;
    xml += `    <summary>${escapeXML(testCase.summary)}</summary>\n`;
    xml += `    <precondition>${escapeXML(testCase.precondition)}</precondition>\n`;
    xml += `    <postcondition>${escapeXML(testCase.postcondition)}</postcondition>\n`;
    xml += `    <status>${escapeXML(testCase.status)}</status>\n`;
    xml += `    <importance>${escapeXML(testCase.importance)}</importance>\n`;
    xml += `    <execution_type>${escapeXML(testCase.execution_type)}</execution_type>\n`;
    
    if (testCase.test_steps && testCase.test_steps.length > 0) {
      xml += '    <test_steps>\n';
      testCase.test_steps.forEach((step: any) => {
        xml += '      <step>\n';
        xml += `        <step_number>${step.step_number}</step_number>\n`;
        xml += `        <step_action>${escapeXML(step.step_action)}</step_action>\n`;
        xml += `        <expected_result>${escapeXML(step.expected_result)}</expected_result>\n`;
        xml += `        <execution_type>${escapeXML(step.execution_type)}</execution_type>\n`;
        xml += '      </step>\n';
      });
      xml += '    </test_steps>\n';
    }
    
    xml += '  </testcase>\n';
  });
  
  xml += '</testcases>';
  return xml;
}

function escapeXML(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const suiteInfo = await getTestSuiteInfo(data.test_suite_id);
    const xml = generateXML(data, suiteInfo);

    // Send to n8n webhook
    const n8nResponse = await fetch('http://localhost:5678/webhook-test/export-to-n8n', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        xml,
        test_suite_id: data.test_suite_id 
      }),
    });

    if (!n8nResponse.ok) {
      throw new Error('Failed to send to n8n');
    }

    return NextResponse.json({ message: 'Successfully sent to n8n workflow' });
  } catch (error) {
    console.error('Error exporting to XML:', error);
    return NextResponse.json(
      { error: 'Failed to export to XML' },
      { status: 500 }
    );
  }
} 