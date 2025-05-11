import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const result = await pool.query(
    'SELECT excel_file_path FROM testlink_exports WHERE id = $1',
    [id]
  )
  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const base64 = result.rows[0].excel_file_path
  if (!base64) {
    return NextResponse.json({ error: 'No Excel file found for this export' }, { status: 404 })
  }
  const buffer = Buffer.from(base64, 'base64')

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="export.xlsx"',
    },
  })
} 