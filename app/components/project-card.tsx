"use client"

import { useState } from "react"
import { Calendar, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Project } from "../types/project"
import EditProjectModal from "./edit-project-modal"

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/projects?id=${project.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete project')
      }

      router.refresh()
    } catch (error) {
      console.error('Error deleting project:', error)
      // You might want to show an error message to the user here
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card className="group relative">
        <Link href={`/projects/${project.id}`} className="absolute inset-0 z-0" />
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl group-hover:text-primary transition-colors">
              {project.name}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={(e) => e.preventDefault()}
                  className="z-10"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.preventDefault()
                  setIsEditModalOpen(true)
                }}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive" 
                  onClick={(e) => {
                    e.preventDefault()
                    handleDelete()
                  }}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{project.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
          </div>
        </CardFooter>
      </Card>

      <EditProjectModal 
        project={project}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </>
  )
}
