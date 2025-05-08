"use client"

import { useState } from "react"
import { TestCase } from "@/app/types/test-cases"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface EditTestCaseDialogProps {
  testCase: TestCase
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTestCaseDialog({
  testCase,
  open,
  onOpenChange,
}: EditTestCaseDialogProps) {
  const [formData, setFormData] = useState({
    title: testCase.title,
    summary: testCase.summary,
    precondition: testCase.precondition || "",
    postcondition: testCase.postcondition || "",
    status: testCase.status,
    importance: testCase.importance,
    execution_type: testCase.execution_type,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch(`/api/test-cases/${testCase.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update test case")
      }

      onOpenChange(false)
      window.location.reload()
    } catch (error) {
      console.error("Error updating test case:", error)
      alert("Failed to update test case")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Test Case</DialogTitle>
          <DialogDescription>
            Make changes to the test case here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) =>
                  setFormData({ ...formData, summary: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="precondition">Precondition</Label>
              <Textarea
                id="precondition"
                value={formData.precondition}
                onChange={(e) =>
                  setFormData({ ...formData, precondition: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="postcondition">Postcondition</Label>
              <Textarea
                id="postcondition"
                value={formData.postcondition}
                onChange={(e) =>
                  setFormData({ ...formData, postcondition: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Run">Not Run</SelectItem>
                  <SelectItem value="Passed">Passed</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="importance">Importance</Label>
              <Select
                value={formData.importance}
                onValueChange={(value) =>
                  setFormData({ ...formData, importance: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select importance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="execution_type">Execution Type</Label>
              <Select
                value={formData.execution_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, execution_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select execution type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="Automated">Automated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 