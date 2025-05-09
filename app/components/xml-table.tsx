"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface TestLinkExport {
  id: number
  test_suite_id: string
  xml_file: string
  created_at: string
}

interface XmlTableProps {
  testSuiteId: string;
}

export default function XmlTable({ testSuiteId }: XmlTableProps) {
  const [exports, setExports] = useState<TestLinkExport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<number | null>(null)

  useEffect(() => {
    const fetchExports = async () => {
      console.log('Fetching exports for test suite:', testSuiteId)
      try {
        const response = await fetch(`/api/testlink-exports?test_suite_id=${testSuiteId}`)
        console.log('Response status:', response.status)
        
        const data = await response.json()
        console.log('Fetched data:', data)
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch exports')
        }
        
        setExports(data)
      } catch (error) {
        console.error('Error fetching exports:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch exports')
      } finally {
        setIsLoading(false)
      }
    }

    fetchExports()
  }, [testSuiteId])

  const handleDownload = (id: number, xmlFile: string) => {
    setDownloading(id)
    
    try {
      const blob = new Blob([xmlFile], { type: 'application/xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `test-suite-${testSuiteId}-${id}.xml`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading file:', error)
      setError(error instanceof Error ? error.message : 'Failed to download file')
    } finally {
      setDownloading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-muted-foreground">Loading exports...</div>
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

  if (exports.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-muted-foreground">No exports found for this test suite.</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Test Suite Exports</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exports.map((export_) => (
              <TableRow key={export_.id}>
                <TableCell className="font-medium">{export_.id}</TableCell>
                <TableCell>{new Date(export_.created_at).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(export_.id, export_.xml_file)}
                    disabled={downloading === export_.id}
                  >
                    {downloading === export_.id ? (
                      <span className="flex items-center gap-1">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Downloading...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        Download XML
                      </span>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
