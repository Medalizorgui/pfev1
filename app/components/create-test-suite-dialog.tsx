"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

interface CreateTestSuiteDialogProps {
  parentSuiteId?: string | null
}

export function CreateTestSuiteDialog({ parentSuiteId = null }: CreateTestSuiteDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [details, setDetails] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const projectId = params.id as string

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/test-suites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          name,
          details,
          parent_suite_id: parentSuiteId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create test suite')
      }

      // Reset form and close dialog
      setName("")
      setDetails("")
      setOpen(false)
      // Refresh the page to show the new test suite
      window.location.reload()
    } catch (error) {
      console.error('Error creating test suite:', error)
      setError("Failed to create test suite. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Test Suite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Test Suite</DialogTitle>
            <DialogDescription>
              {parentSuiteId 
                ? "Create a new test suite within the current suite."
                : "Create a new test suite for your project."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter test suite name"
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="details" className="text-sm font-medium">
                Details
              </label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Enter test suite details (optional)"
                className="min-h-[100px]"
              />
            </div>
            {error && (
              <div className="text-sm text-destructive">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 