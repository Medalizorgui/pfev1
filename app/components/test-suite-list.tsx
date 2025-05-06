"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { FileText } from "lucide-react"
import Link from "next/link"
import { CreateTestSuiteDialog } from "./create-test-suite-dialog"

interface TestSuite {
  id: string
  name: string
  project_id: string
  parent_suite_id: string | null
  details: string | null
  created_at: string
}

export function TestSuiteList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [testSuites, setTestSuites] = useState<TestSuite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const projectId = params.id as string

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
      } finally {
        setIsLoading(false)
      }
    }

    fetchTestSuites()
  }, [projectId])

  const filteredTestSuites = testSuites.filter(
    (suite) =>
      suite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (suite.details?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  )

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-muted-foreground">Loading test suites...</div>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search test suites..."
            className="max-w-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <CreateTestSuiteDialog />
      </div>

      {filteredTestSuites.length === 0 ? (
        <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <FileText className="h-10 w-10 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No test suites found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or create a new test suite.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTestSuites.map((suite) => (
            <Link key={suite.id} href={`/projects/${projectId}/test-suites/${suite.id}`} className="group">
              <Card className="h-full transition-all hover:shadow-md">
                <CardHeader>
                  <CardTitle className="group-hover:text-primary">{suite.name}</CardTitle>
                  <CardDescription>{suite.details}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Created on {new Date(suite.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  {suite.parent_suite_id ? "Child suite" : "Root suite"}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
