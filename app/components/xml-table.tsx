"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download, Plus, FileDown, FileSpreadsheet } from "lucide-react"

interface TestLinkExport {
  id: number
  test_suite_id: string
  xml_file?: string
  excel_file_path?: string
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
  const [generating, setGenerating] = useState(false)

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

  const handleDownload = async (id: number, file: string | undefined, type: 'xml' | 'excel') => {
    setDownloading(id)
    try {
      if (type === 'excel') {
        // Download Excel from API
        const response = await fetch(`/api/download-excel?id=${id}`)
        if (!response.ok) throw new Error('Failed to download Excel')
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `test-suite-${testSuiteId}-${id}.xlsx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        // Download XML as before
        const blob = new Blob([file!], { type: 'application/xml' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `test-suite-${testSuiteId}-${id}.xml`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error downloading file:', error)
      setError(error instanceof Error ? error.message : 'Failed to download file')
    } finally {
      setDownloading(null)
    }
  }

  const handleGenerateXml = async () => {
    setGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/generate-testlink-xml', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testSuiteId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate XML')
      }

      const newExport = await response.json()
      setExports(prevExports => [newExport, ...prevExports])
    } catch (error) {
      console.error('Error generating XML:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate XML')
    } finally {
      setGenerating(false)
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Test Suite Exports</h1>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateXml}
            disabled={generating}
            className="flex items-center gap-2"
          >
            {generating ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Generating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Generate Export
              </>
            )}
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exports.map((export_) => (
              <TableRow key={export_.id}>
                <TableCell className="font-medium">{export_.id}</TableCell>
                <TableCell>{new Date(export_.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {export_.xml_file ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        XML
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Excel
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {export_.xml_file && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(export_.id, export_.xml_file, 'xml')}
                        disabled={downloading === export_.id}
                      >
                        {downloading === export_.id ? (
                          <span className="flex items-center gap-1">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Downloading...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <FileDown className="h-4 w-4" />
                            Download XML
                          </span>
                        )}
                      </Button>
                    )}
                    {export_.excel_file_path && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(export_.id, export_.excel_file_path, 'excel')}
                        disabled={downloading === export_.id}
                      >
                        {downloading === export_.id ? (
                          <span className="flex items-center gap-1">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Downloading...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <FileSpreadsheet className="h-4 w-4" />
                            Download Excel
                          </span>
                        )}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
