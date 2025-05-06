"use client"

import { useState, useEffect } from "react"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TestSuite {
  id: string
  name: string
  project_id: string
  parent_suite_id: string | null
  details: string | null
  created_at: string
}

interface GenerateTestCasesDialogProps {
  projectId: string
  userStoryIds: string[]
  onGenerate: (testSuiteId: string | null, newTestSuite?: { name: string; details: string }) => Promise<void>
}

export function GenerateTestCasesDialog({ projectId, userStoryIds, onGenerate }: GenerateTestCasesDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [testSuites, setTestSuites] = useState<TestSuite[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTestSuite, setSelectedTestSuite] = useState<string>("")
  const [newTestSuite, setNewTestSuite] = useState({
    name: "",
    details: "",
  })

  useEffect(() => {
    const fetchTestSuites = async () => {
      try {
        const response = await fetch(`/api/test-suites?project_id=${projectId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch test suites')
        }
        const data = await response.json()
        setTestSuites(data)
      } catch (error) {
        console.error('Error fetching test suites:', error)
        setError("Failed to fetch test suites")
      }
    }

    if (isOpen) {
      fetchTestSuites()
    }
  }, [isOpen, projectId])

  const handleSubmit = async (tab: string) => {
    setIsLoading(true)
    setError(null)

    try {
      if (tab === "existing" && !selectedTestSuite) {
        throw new Error("Please select a test suite")
      }

      if (tab === "new" && !newTestSuite.name) {
        throw new Error("Please enter a name for the new test suite")
      }

      await onGenerate(
        tab === "existing" ? selectedTestSuite : null,
        tab === "new" ? newTestSuite : undefined
      )

      setIsOpen(false)
    } catch (error) {
      console.error('Error generating test cases:', error)
      setError(error instanceof Error ? error.message : "Failed to generate test cases")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={userStoryIds.length === 0}>
          Generate Test Cases
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Test Cases</DialogTitle>
          <DialogDescription>
            Choose how you want to generate test cases for the selected user stories.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="existing" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Existing Suite</TabsTrigger>
            <TabsTrigger value="new">New Suite</TabsTrigger>
          </TabsList>
          <TabsContent value="existing" className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="test-suite">Select Test Suite</Label>
              <Select value={selectedTestSuite} onValueChange={setSelectedTestSuite}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a test suite" />
                </SelectTrigger>
                <SelectContent>
                  {testSuites.map((suite) => (
                    <SelectItem key={suite.id} value={suite.id}>
                      {suite.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={() => handleSubmit("existing")} 
              disabled={isLoading || !selectedTestSuite}
              className="w-full"
            >
              {isLoading ? "Generating..." : "Generate with Existing Suite"}
            </Button>
          </TabsContent>
          <TabsContent value="new" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newTestSuite.name}
                  onChange={(e) => setNewTestSuite({ ...newTestSuite, name: e.target.value })}
                  placeholder="Enter test suite name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="details">Details</Label>
                <Textarea
                  id="details"
                  value={newTestSuite.details}
                  onChange={(e) => setNewTestSuite({ ...newTestSuite, details: e.target.value })}
                  placeholder="Enter test suite details"
                />
              </div>
            </div>
            <Button 
              onClick={() => handleSubmit("new")} 
              disabled={isLoading || !newTestSuite.name}
              className="w-full"
            >
              {isLoading ? "Generating..." : "Generate with New Suite"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 