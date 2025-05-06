"use client"

import { useState } from "react"
import { useTestCases } from "../hooks/use-test-cases"
import type { TestCase, TestStep } from "../types/test-cases"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, ChevronUp, Search, SortAsc, SortDesc } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import React from "react"

export function TestCaseTable() {
  const { testCases, isLoading } = useTestCases()
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [importanceFilter, setImportanceFilter] = useState<string | null>(null)
  const [sortField, setSortField] = useState<string | null>("id")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const filteredTestCases = testCases
    .filter((testCase) => {
      const matchesSearch =
        searchTerm === "" ||
        testCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testCase.summary.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = !statusFilter || testCase.status === statusFilter

      const matchesImportance = !importanceFilter || testCase.importance === importanceFilter

      return matchesSearch && matchesStatus && matchesImportance
    })
    .sort((a, b) => {
      if (!sortField) return 0

      const fieldA = a[sortField as keyof TestCase]
      const fieldB = b[sortField as keyof TestCase]

      if (typeof fieldA === "string" && typeof fieldB === "string") {
        return sortDirection === "asc" ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA)
      }

      if (typeof fieldA === "number" && typeof fieldB === "number") {
        return sortDirection === "asc" ? fieldA - fieldB : fieldB - fieldA
      }

      return 0
    })

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search test cases..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value || null)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Passed">Passed</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
              <SelectItem value="Blocked">Blocked</SelectItem>
              <SelectItem value="Not Run">Not Run</SelectItem>
            </SelectContent>
          </Select>
          <Select value={importanceFilter || ""} onValueChange={(value) => setImportanceFilter(value || null)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Importance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Importance</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("id")}>
                  ID
                  {sortField === "id" && (
                    <span className="ml-1 inline-block">
                      {sortDirection === "asc" ? (
                        <SortAsc className="h-3 w-3 inline" />
                      ) : (
                        <SortDesc className="h-3 w-3 inline" />
                      )}
                    </span>
                  )}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("title")}>
                  Title
                  {sortField === "title" && (
                    <span className="ml-1 inline-block">
                      {sortDirection === "asc" ? (
                        <SortAsc className="h-3 w-3 inline" />
                      ) : (
                        <SortDesc className="h-3 w-3 inline" />
                      )}
                    </span>
                  )}
                </TableHead>
                <TableHead>Summary</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                  Status
                  {sortField === "status" && (
                    <span className="ml-1 inline-block">
                      {sortDirection === "asc" ? (
                        <SortAsc className="h-3 w-3 inline" />
                      ) : (
                        <SortDesc className="h-3 w-3 inline" />
                      )}
                    </span>
                  )}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("importance")}>
                  Importance
                  {sortField === "importance" && (
                    <span className="ml-1 inline-block">
                      {sortDirection === "asc" ? (
                        <SortAsc className="h-3 w-3 inline" />
                      ) : (
                        <SortDesc className="h-3 w-3 inline" />
                      )}
                    </span>
                  )}
                </TableHead>
                <TableHead>Execution Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTestCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    No test cases found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTestCases.map((testCase) => (
                  <React.Fragment key={testCase.id}>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleRow(testCase.id)}
                    >
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleRow(testCase.id)
                          }}
                        >
                          {expandedRows[testCase.id] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{testCase.id}</TableCell>
                      <TableCell>{testCase.title}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{testCase.summary}</TableCell>
                      <TableCell>
                        <StatusBadge status={testCase.status} />
                      </TableCell>
                      <TableCell>
                        <ImportanceBadge importance={testCase.importance} />
                      </TableCell>
                      <TableCell>{testCase.execution_type}</TableCell>
                    </TableRow>
                    {expandedRows[testCase.id] && (
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={7} className="p-0">
                          <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <h4 className="font-semibold mb-1">Precondition</h4>
                                <p className="text-sm text-muted-foreground">{testCase.precondition}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-1">Postcondition</h4>
                                <p className="text-sm text-muted-foreground">{testCase.postcondition}</p>
                              </div>
                            </div>
                            <h4 className="font-semibold mb-2">Test Steps</h4>
                            <TestStepsTable testSteps={testCase.test_steps} />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

function TestStepsTable({ testSteps }: { testSteps: TestStep[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Step #</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Expected Result</TableHead>
          <TableHead className="w-32">Execution Type</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {testSteps.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-4">
              No test steps found for this test case.
            </TableCell>
          </TableRow>
        ) : (
          testSteps.map((step) => (
            <TableRow key={step.id}>
              <TableCell className="font-medium">{step.step_number}</TableCell>
              <TableCell>{step.step_action}</TableCell>
              <TableCell>{step.expected_result}</TableCell>
              <TableCell>{step.execution_type}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

function StatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default"

  switch (status.toLowerCase()) {
    case "passed":
      variant = "default"
      break
    case "failed":
      variant = "destructive"
      break
    case "blocked":
      variant = "secondary"
      break
    case "not run":
      variant = "outline"
      break
  }

  return <Badge variant={variant}>{status}</Badge>
}

function ImportanceBadge({ importance }: { importance: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "secondary"

  switch (importance.toLowerCase()) {
    case "high":
      variant = "destructive"
      break
    case "medium":
      variant = "default"
      break
    case "low":
      variant = "secondary"
      break
  }

  return <Badge variant={variant}>{importance}</Badge>
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <Card>
        <div className="p-4">
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </Card>
    </div>
  )
}
