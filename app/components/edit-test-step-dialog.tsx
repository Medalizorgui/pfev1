"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
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
import { TestStep } from "@/app/types/test-cases"

interface EditTestStepDialogProps {
  testStep: TestStep
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTestStepDialog({
  testStep,
  open,
  onOpenChange,
}: EditTestStepDialogProps) {
  const [formData, setFormData] = useState<TestStep>(testStep)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = testStep.id === 0
        ? '/api/test-steps'
        : `/api/test-steps/${testStep.id}`

      const response = await fetch(url, {
        method: testStep.id === 0 ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to save test step')
      }

      onOpenChange(false)
      window.location.reload()
    } catch (error) {
      console.error('Error saving test step:', error)
      alert('Failed to save test step')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {testStep.id === 0 ? 'Add Test Step' : 'Edit Test Step'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="step_number">Step Number</Label>
            <Input
              id="step_number"
              type="number"
              value={formData.step_number}
              onChange={(e) =>
                setFormData({ ...formData, step_number: parseInt(e.target.value) })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="step_action">Step Action</Label>
            <Textarea
              id="step_action"
              value={formData.step_action}
              onChange={(e) =>
                setFormData({ ...formData, step_action: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expected_result">Expected Result</Label>
            <Textarea
              id="expected_result"
              value={formData.expected_result}
              onChange={(e) =>
                setFormData({ ...formData, expected_result: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
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

          <div className="flex justify-end gap-2">
            <Button type="submit">
              {testStep.id === 0 ? 'Add Step' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 