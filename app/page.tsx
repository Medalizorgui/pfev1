import { PlusCircle, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ProjectCard from "./components/project-card"
import EmptyState from "./components/empty-state"
import CreateProjectModal from "./components/create-project-modal"
import pool from "@/lib/db"
import { Project } from "./types/project"

async function getProjects(): Promise<Project[]> {
  const client = await pool.connect()
  try {
    const result = await client.query('SELECT * FROM projects ORDER BY created_at DESC')
    return result.rows
  } finally {
    client.release()
  }
}

export default async function Home() {
  const projects = await getProjects()

  return (
    <main className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <CreateProjectModal>
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" />
            New Project
          </Button>
        </CreateProjectModal>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search projects..."
          className="pl-9"
        />
      </div>

      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: Project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </main>
  )
}
