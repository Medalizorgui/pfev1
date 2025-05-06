import { FolderPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import CreateProjectModal from "../components/create-project-modal"

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg bg-muted/40">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
        <FolderPlus className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        You haven't created any projects yet. Get started by creating your first project.
      </p>
      <CreateProjectModal>
        <Button size="lg">
          <FolderPlus className="mr-2 h-5 w-5" />
          Create Your First Project
        </Button>
      </CreateProjectModal>
    </div>
  )
}
