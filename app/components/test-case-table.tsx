"use client"

import React, { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Plus, ChevronDown, ChevronRight, FileDown } from "lucide-react"
import { useTestCases } from "@/app/hooks/use-test-cases"
import { TestCase, TestStep } from "@/app/types/test-cases"
import { EditTestCaseDialog } from "@/app/components/edit-test-case-dialog"
import { EditTestStepDialog } from "./edit-test-step-dialog"
import { Checkbox } from "@/components/ui/checkbox"

interface TestCaseTableProps {
  testSuiteId: string
}

export function TestCaseTable({ testSuiteId }: TestCaseTableProps) {
  const { testCases, isLoading, error } = useTestCases(testSuiteId)
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null)
  const [selectedTestStep, setSelectedTestStep] = useState<TestStep | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isEditStepDialogOpen, setIsEditStepDialogOpen] = useState(false)
  const [expandedTestCases, setExpandedTestCases] = useState<Set<number>>(new Set())
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(testCases.map(tc => tc.id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (testCaseId: number, checked: boolean) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(testCaseId)
    } else {
      newSelected.delete(testCaseId)
    }
    setSelectedRows(newSelected)
  }

  const handleExportToXML = async () => {
    if (selectedRows.size === 0) {
      alert('Please select at least one test case to export')
      return
    }

    const selectedTestCases = testCases.filter(tc => selectedRows.has(tc.id))
    const data = {
      test_suite_id: testSuiteId,
      test_cases: selectedTestCases
    }

    try {
      const response = await fetch('/api/export-to-n8n', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to export to XML')
      }

      const result = await response.json()
      alert('Successfully sent to n8n workflow')
    } catch (error) {
      console.error('Error exporting to XML:', error)
      alert('Failed to export to XML')
    }
  }

  const handleEdit = (testCase: TestCase) => {
    setSelectedTestCase(testCase)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (testCaseId: number) => {
    if (!confirm('Are you sure you want to delete this test case?')) return

    try {
      const response = await fetch(`/api/test-cases/${testCaseId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete test case')
      }

      window.location.reload()
    } catch (error) {
      console.error('Error deleting test case:', error)
      alert('Failed to delete test case')
    }
  }

  const handleEditStep = (testStep: TestStep) => {
    setSelectedTestStep(testStep)
    setIsEditStepDialogOpen(true)
  }

  const handleDeleteStep = async (testStepId: number) => {
    if (!confirm('Are you sure you want to delete this test step?')) return

    try {
      const response = await fetch(`/api/test-steps/${testStepId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete test step')
      }

      window.location.reload()
    } catch (error) {
      console.error('Error deleting test step:', error)
      alert('Failed to delete test step')
    }
  }

  const handleAddStep = (testCaseId: number) => {
    setSelectedTestStep({
      id: 0,
      test_case_id: testCaseId,
      step_number: 0,
      step_action: "",
      expected_result: "",
      execution_type: "Manual"
    })
    setIsEditStepDialogOpen(true)
  }

  const toggleTestCase = (testCaseId: number) => {
    const newExpanded = new Set(expandedTestCases)
    if (newExpanded.has(testCaseId)) {
      newExpanded.delete(testCaseId)
    } else {
      newExpanded.add(testCaseId)
    }
    setExpandedTestCases(newExpanded)
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-muted-foreground">Loading test cases...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-destructive">{error}</div>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleExportToXML} disabled={selectedRows.size === 0}>
          <FileDown className="mr-2 h-4 w-4" />
          Export to XML
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedRows.size === testCases.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Importance</TableHead>
              <TableHead>Execution Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testCases.map((testCase) => (
              <React.Fragment key={testCase.id}>
                <TableRow>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.has(testCase.id)}
                      onCheckedChange={(checked) => handleSelectRow(testCase.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleTestCase(testCase.id)}
                    >
                      {expandedTestCases.has(testCase.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>{testCase.title}</TableCell>
                  <TableCell>{testCase.status}</TableCell>
                  <TableCell>{testCase.importance}</TableCell>
                  <TableCell>{testCase.execution_type}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAddStep(testCase.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(testCase)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(testCase.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {expandedTestCases.has(testCase.id) && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="pl-8">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[100px]">Step #</TableHead>
                              <TableHead>Action</TableHead>
                              <TableHead>Expected Result</TableHead>
                              <TableHead>Execution Type</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {testCase.test_steps.map((step) => (
                              <TableRow key={step.id}>
                                <TableCell>{step.step_number}</TableCell>
                                <TableCell>{step.step_action}</TableCell>
                                <TableCell>{step.expected_result}</TableCell>
                                <TableCell>{step.execution_type}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEditStep(step)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteStep(step.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedTestCase && (
        <EditTestCaseDialog
          testCase={selectedTestCase}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}

      {selectedTestStep && (
        <EditTestStepDialog
          testStep={selectedTestStep}
          open={isEditStepDialogOpen}
          onOpenChange={setIsEditStepDialogOpen}
        />
      )}
    </>
  )
}