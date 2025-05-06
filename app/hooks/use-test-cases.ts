"use client"

import { useState, useEffect } from "react"
import type { TestCase } from "../types/test-cases"

// This is a mock implementation. In a real app, you would fetch from your API
export function useTestCases() {
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // In a real app, replace this with your actual API call
        // const response = await fetch('/api/test-cases');
        // const data = await response.json();

        // For demo purposes, we'll use mock data
        const mockData = getMockTestCases()

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800))

        setTestCases(mockData)
      } catch (error) {
        console.error("Failed to fetch test cases:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return { testCases, isLoading }
}

// Mock data generator
function getMockTestCases(): TestCase[] {
  return [
    {
      id: 1,
      user_story_id: 101,
      test_suite_id: 201,
      title: "User Login Validation",
      summary: "Verify that users can log in with valid credentials and are rejected with invalid ones",
      precondition: "User account exists in the system",
      postcondition: "User is logged in and redirected to dashboard",
      status: "Passed",
      manual_edit: true,
      importance: "High",
      execution_type: "Automated",
      created_at: "2023-05-15T10:30:00Z",
      updated_at: "2023-05-16T14:20:00Z",
      test_steps: [
        {
          id: 1,
          test_case_id: 1,
          step_number: 1,
          step_action: "Navigate to login page",
          expected_result: "Login form is displayed",
          execution_type: "Automated",
        },
        {
          id: 2,
          test_case_id: 1,
          step_number: 2,
          step_action: "Enter valid username and password",
          expected_result: "Credentials are accepted",
          execution_type: "Automated",
        },
        {
          id: 3,
          test_case_id: 1,
          step_number: 3,
          step_action: "Click login button",
          expected_result: "User is redirected to dashboard",
          execution_type: "Automated",
        },
      ],
    },
    {
      id: 2,
      user_story_id: 102,
      test_suite_id: 201,
      title: "Password Reset Functionality",
      summary: "Verify that users can reset their password through the forgot password flow",
      precondition: "User account exists in the system",
      postcondition: "User password is reset and user can log in with new password",
      status: "Failed",
      manual_edit: false,
      importance: "High",
      execution_type: "Manual",
      created_at: "2023-05-17T09:15:00Z",
      updated_at: "2023-05-18T11:45:00Z",
      test_steps: [
        {
          id: 4,
          test_case_id: 2,
          step_number: 1,
          step_action: "Navigate to login page",
          expected_result: "Login form is displayed",
          execution_type: "Manual",
        },
        {
          id: 5,
          test_case_id: 2,
          step_number: 2,
          step_action: "Click 'Forgot Password' link",
          expected_result: "Password reset form is displayed",
          execution_type: "Manual",
        },
        {
          id: 6,
          test_case_id: 2,
          step_number: 3,
          step_action: "Enter registered email address",
          expected_result: "Reset email is sent to user",
          execution_type: "Manual",
        },
        {
          id: 7,
          test_case_id: 2,
          step_number: 4,
          step_action: "Click reset link in email",
          expected_result: "New password form is displayed",
          execution_type: "Manual",
        },
      ],
    },
    {
      id: 3,
      user_story_id: 103,
      test_suite_id: 202,
      title: "User Profile Update",
      summary: "Verify that users can update their profile information",
      precondition: "User is logged in",
      postcondition: "User profile information is updated",
      status: "Not Run",
      manual_edit: true,
      importance: "Medium",
      execution_type: "Manual",
      created_at: "2023-05-19T13:20:00Z",
      updated_at: "2023-05-19T13:20:00Z",
      test_steps: [
        {
          id: 8,
          test_case_id: 3,
          step_number: 1,
          step_action: "Navigate to profile page",
          expected_result: "Profile form is displayed with current information",
          execution_type: "Manual",
        },
        {
          id: 9,
          test_case_id: 3,
          step_number: 2,
          step_action: "Update profile fields",
          expected_result: "Fields are updated with new information",
          execution_type: "Manual",
        },
        {
          id: 10,
          test_case_id: 3,
          step_number: 3,
          step_action: "Click save button",
          expected_result: "Success message is displayed and information is saved",
          execution_type: "Manual",
        },
      ],
    },
    {
      id: 4,
      user_story_id: 104,
      test_suite_id: 202,
      title: "Data Export Functionality",
      summary: "Verify that users can export their data in various formats",
      precondition: "User is logged in and has data to export",
      postcondition: "Data is exported in the selected format",
      status: "Blocked",
      manual_edit: false,
      importance: "Low",
      execution_type: "Automated",
      created_at: "2023-05-20T15:10:00Z",
      updated_at: "2023-05-21T09:30:00Z",
      test_steps: [
        {
          id: 11,
          test_case_id: 4,
          step_number: 1,
          step_action: "Navigate to data page",
          expected_result: "Data table is displayed",
          execution_type: "Automated",
        },
        {
          id: 12,
          test_case_id: 4,
          step_number: 2,
          step_action: "Click export button",
          expected_result: "Export options are displayed",
          execution_type: "Automated",
        },
        {
          id: 13,
          test_case_id: 4,
          step_number: 3,
          step_action: "Select CSV format",
          expected_result: "Export starts and file is downloaded",
          execution_type: "Automated",
        },
      ],
    },
    {
      id: 5,
      user_story_id: 105,
      test_suite_id: 203,
      title: "Search Functionality",
      summary: "Verify that users can search for items and get relevant results",
      precondition: "User is on the search page",
      postcondition: "Search results are displayed",
      status: "Passed",
      manual_edit: true,
      importance: "Medium",
      execution_type: "Automated",
      created_at: "2023-05-22T11:45:00Z",
      updated_at: "2023-05-23T14:15:00Z",
      test_steps: [
        {
          id: 14,
          test_case_id: 5,
          step_number: 1,
          step_action: "Enter search term in search box",
          expected_result: "Search term is displayed in search box",
          execution_type: "Automated",
        },
        {
          id: 15,
          test_case_id: 5,
          step_number: 2,
          step_action: "Press enter or click search button",
          expected_result: "Search results are displayed",
          execution_type: "Automated",
        },
        {
          id: 16,
          test_case_id: 5,
          step_number: 3,
          step_action: "Verify results contain search term",
          expected_result: "All results contain the search term",
          execution_type: "Manual",
        },
      ],
    },
  ]
}
