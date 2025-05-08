"use client"

import { useState, useEffect } from "react"
import type { TestCase } from "../types/test-cases"

export function useTestCases(testSuiteId?: string) {
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const url = testSuiteId 
          ? `/api/test-cases?test_suite_id=${testSuiteId}`
          : '/api/test-cases'
        
        console.log('Fetching test cases with URL:', url)
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`Error fetching test cases: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Received test cases:', data)
        setTestCases(data)
      } catch (error) {
        console.error("Failed to fetch test cases:", error)
        setError("Failed to load test cases. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [testSuiteId])

  return { testCases, isLoading, error }
}