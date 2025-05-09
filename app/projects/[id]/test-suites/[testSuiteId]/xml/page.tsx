"use client"

import { useParams } from "next/navigation"
import  XmlTable  from "@/app/components/xml-table"

export default function XmlViewPage() {
  const params = useParams()
  const testSuiteId = params?.testSuiteId as string

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">XML View</h1>
      </div>
      <XmlTable testSuiteId={testSuiteId} />
    </div>
  )
} 