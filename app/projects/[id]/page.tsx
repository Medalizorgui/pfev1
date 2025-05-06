import { ArrowLeft, ListTodo, TestTube2 } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import pool from "@/lib/db"
import { Project } from "@/app/types/project"
import DocumentUpload from "./components/document-upload"
import { Button } from "@/components/ui/button"

async function getProject(id: string): Promise<Project | null> {
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    return null
  }

  const client = await pool.connect()
  try {
    const result = await client.query('SELECT * FROM projects WHERE id = $1', [id])
    return result.rows[0] || null
  } finally {
    client.release()
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params
  const project = await getProject(id)

  if (!project) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/projects/${project.id}/userstories`}>
              <Button>
                <ListTodo className="mr-2 h-4 w-4" />
                View User Stories
              </Button>
            </Link>
            <Link href={`/projects/${project.id}/test-suites`}>
              <Button>
                <TestTube2 className="mr-2 h-4 w-4" />
                View Test Suites
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
            <DocumentUpload projectId={project.id} />
          </div>
        </div>
      </div>
    </div>
  )
} 