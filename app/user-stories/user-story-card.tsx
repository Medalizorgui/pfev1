"use client"

import { useState } from "react"
import { Edit, Trash2, Check, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { UserStory } from "./types"

interface UserStoryCardProps {
  story: UserStory
  isSelected: boolean
  onSelect: (checked: boolean) => void
  onEdit: () => void
  onDelete: () => void
  onValidate: () => void
}

export function UserStoryCard({ story, isSelected, onSelect, onEdit, onDelete, onValidate }: UserStoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-200 text-gray-800"
      case "in_review":
        return "bg-blue-100 text-blue-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "validated":
        return "bg-emerald-100 text-emerald-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-200 text-gray-800"
    }
  }

  return (
    <Card className={`border ${isSelected ? "border-primary" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Checkbox checked={isSelected} onCheckedChange={onSelect} className="mt-1" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{story.title}</h3>
                <Badge variant="outline" className={getStatusColor(story.status)}>
                  {story.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Project: {story.project_id} • ID: {story.id}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <p className="text-sm line-clamp-2">{story.description}</p>

        {isExpanded && (
          <div className="mt-4 space-y-4 text-sm">
            {story.acceptance_criteria && (
              <div>
                <h4 className="font-semibold mb-1">Acceptance Criteria</h4>
                <p className="whitespace-pre-line">{story.acceptance_criteria}</p>
              </div>
            )}

            {story.business_rules && (
              <div>
                <h4 className="font-semibold mb-1">Business Rules</h4>
                <p className="whitespace-pre-line">{story.business_rules}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">Created:</span> {formatDate(story.created_at)}
              </div>
              <div>
                <span className="font-medium">Updated:</span> {formatDate(story.updated_at)}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2">
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>

          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this user story? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    onDelete()
                    setIsDeleteDialogOpen(false)
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="default" size="sm" onClick={onValidate} disabled={story.status === "validated"}>
            <Check className="h-4 w-4 mr-1" />
            Validate
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
