"use client"

import { useState, useRef } from "react"
import { Upload } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface DocumentUploadProps {
  projectId: string
}

export default function DocumentUpload({ projectId }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ]
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF, Word document, or text file')
        return
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }

      setError(null)
      setSelectedFile(file)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('projectId', projectId)

    try {
      const response = await fetch('http://localhost:5678/webhook-test/json-upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(errorData || 'Failed to upload document')
      }

      // Reset the file input and selected file
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setSelectedFile(null)
      
      // Refresh the page to show any updates
      router.refresh()
    } catch (error) {
      console.error('Error uploading document:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload document')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium">Upload Document</h3>
            <p className="text-sm text-muted-foreground">
              {selectedFile 
                ? `Selected: ${selectedFile.name}`
                : 'Drag and drop your file here, or click to select a file'}
            </p>
            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
            )}
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <Button 
              variant="outline" 
              className="relative"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              Select File
            </Button>
            {selectedFile && (
              <Button 
                onClick={handleFileUpload}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 