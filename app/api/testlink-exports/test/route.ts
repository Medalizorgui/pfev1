import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    // First, check if the table exists
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'testlink_exports'
      );
    `
    const tableExists = await pool.query(tableCheckQuery)
    console.log('Table exists:', tableExists.rows[0].exists)

    if (!tableExists.rows[0].exists) {
      return NextResponse.json({ error: 'Table testlink_exports does not exist' }, { status: 404 })
    }

    // If table exists, get its structure
    const structureQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'testlink_exports';
    `
    const structure = await pool.query(structureQuery)
    console.log('Table structure:', structure.rows)

    // Get count of records
    const countQuery = 'SELECT COUNT(*) FROM testlink_exports;'
    const count = await pool.query(countQuery)
    console.log('Record count:', count.rows[0].count)

    return NextResponse.json({
      tableExists: tableExists.rows[0].exists,
      structure: structure.rows,
      recordCount: count.rows[0].count
    })
  } catch (error) {
    console.error('Error checking database:', error)
    return NextResponse.json({ error: 'Failed to check database' }, { status: 500 })
  }
} 