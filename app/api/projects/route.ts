import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db'; // Adjust the import path as necessary

// GET: Fetch all projects
export async function GET() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM projects ORDER BY created_at DESC');
        client.release();

        return NextResponse.json(result.rows, { status: 200 });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}

// POST: Create a new project
export async function POST(request: NextRequest) {
    try {
        const { name, description } = await request.json();
        
        const client = await pool.connect();
        const result = await client.query(
            'INSERT INTO projects (name, description, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING *',
            [name, description]
        );
        client.release();

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}

// PUT: Update a project
export async function PUT(request: NextRequest) {
    try {
        const { id, name, description } = await request.json();
        
        const client = await pool.connect();
        const result = await client.query(
            'UPDATE projects SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
            [name, description, id]
        );
        client.release();

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0], { status: 200 });
    } catch (error) {
        console.error('Error updating project:', error);
        return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }
}

// DELETE: Delete a project
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        const client = await pool.connect();
        const result = await client.query(
            'DELETE FROM projects WHERE id = $1 RETURNING *',
            [id]
        );
        client.release();

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Project deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting project:', error);
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }
}