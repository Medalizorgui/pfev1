"use client"

import { TestSuiteDetails } from "@/app/components/test-suite-details"
import { useParams } from "next/navigation"

export default function TestSuitePage() {
  const params = useParams();
  const id = params?.id as string;
  const testSuiteId = params?.testSuiteId as string;

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Test Suite Details</h1>
      </div>
      <TestSuiteDetails />
    </div>
  )
} 