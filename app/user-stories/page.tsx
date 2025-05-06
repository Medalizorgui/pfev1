"use client"

import { useState, useEffect } from "react"
import { Plus, Check, ArrowUpDown, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { UserStoryForm } from "./user-story-form"
import { UserStoryCard } from "./user-story-card"
import type { UserStory } from "./types"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function UserStoriesPage() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get("project_id")
  
  const [userStories, setUserStories] = useState<UserStory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStories, setSelectedStories] = useState<string[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentUserStory, setCurrentUserStory] = useState<UserStory | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<string>("updated_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [alert, setAlert] = useState<{ title: string; description: string; variant?: "default" | "destructive" } | null>(null)

  useEffect(() => {
    const fetchUserStories = async () => {
      try {
        setIsLoading(true)
        if (!projectId) {
          setAlert({
            title: "Error",
            description: "Project ID is required to fetch user stories.",
            variant: "destructive"
          })
          return
        }
        const response = await fetch(`/api/user-stories?project_id=${projectId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch user stories')
        }
        const data = await response.json()
        setUserStories(data)
      } catch (error) {
        console.error('Error fetching user stories:', error)
        setAlert({
          title: "Error",
          description: "Failed to fetch user stories. Please try again later.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserStories()
  }, [projectId])

  // Filter and sort user stories
  const filteredUserStories = userStories
    .filter(
      (story) =>
        (!projectId || story.project_id === projectId) &&
        (filterStatus === "all" || story.status === filterStatus) &&
        (searchQuery === "" ||
          story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          story.description.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    .sort((a, b) => {
      const fieldA = a[sortField as keyof UserStory]
      const fieldB = b[sortField as keyof UserStory]

      if (typeof fieldA === "string" && typeof fieldB === "string") {
        return sortDirection === "asc" ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA)
      }

      // For dates
      if (sortField === "created_at" || sortField === "updated_at") {
        const dateA = new Date(fieldA as string).getTime()
        const dateB = new Date(fieldB as string).getTime()
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA
      }

      return 0
    })

  const handleCreateUserStory = (newUserStory: Omit<UserStory, "id" | "created_at" | "updated_at">) => {
    const now = new Date().toISOString()
    const story: UserStory = {
      id: `us-${Date.now()}`,
      created_at: now,
      updated_at: now,
      ...newUserStory,
    }

    setUserStories([...userStories, story])
    setIsCreateDialogOpen(false)
    setAlert({
      title: "User Story Created",
      description: "The user story has been successfully created.",
    })
  }

  const handleUpdateUserStory = (updatedUserStory: UserStory | Omit<UserStory, "id" | "created_at" | "updated_at">) => {
    if (!('id' in updatedUserStory)) {
      return
    }
    setUserStories(
      userStories.map((story) =>
        story.id === updatedUserStory.id ? { ...updatedUserStory, updated_at: new Date().toISOString() } : story,
      ),
    )
    setIsEditDialogOpen(false)
    setCurrentUserStory(null)
    setAlert({
      title: "User Story Updated",
      description: "The user story has been successfully updated.",
    })
  }

  const handleDeleteUserStory = (id: string) => {
    setUserStories(userStories.filter((story) => story.id !== id))
    setSelectedStories(selectedStories.filter((storyId) => storyId !== id))
    setAlert({
      title: "User Story Deleted",
      description: "The user story has been successfully deleted.",
    })
  }

  const handleValidateUserStory = (id: string) => {
    setUserStories(
      userStories.map((story) =>
        story.id === id ? { ...story, status: "validated", updated_at: new Date().toISOString() } : story,
      ),
    )
    setAlert({
      title: "User Story Validated",
      description: "The user story has been marked as validated.",
    })
  }

  const handleValidateSelected = () => {
    if (selectedStories.length === 0) {
      setAlert({
        title: "No Stories Selected",
        description: "Please select at least one user story to validate.",
        variant: "destructive",
      })
      return
    }

    setUserStories(
      userStories.map((story) =>
        selectedStories.includes(story.id)
          ? { ...story, status: "validated", updated_at: new Date().toISOString() }
          : story,
      ),
    )
    setAlert({
      title: "User Stories Validated",
      description: `${selectedStories.length} user stories have been marked as validated.`,
    })
    setSelectedStories([])
  }

  const handleSelectStory = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedStories([...selectedStories, id])
    } else {
      setSelectedStories(selectedStories.filter((storyId) => storyId !== id))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStories(filteredUserStories.map((story) => story.id))
    } else {
      setSelectedStories([])
    }
  }

  const handleEditClick = (story: UserStory) => {
    setCurrentUserStory(story)
    setIsEditDialogOpen(true)
  }

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  return (
    <div className="container mx-auto py-8">
      {alert && (
        <Alert className="mb-4" variant={alert.variant}>
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>{alert.description}</AlertDescription>
        </Alert>
      )}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-4">
            {projectId && (
              <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to projects
              </Link>
            )}
            <div>
              <h1 className="text-3xl font-bold">User Stories</h1>
              <p className="text-muted-foreground">Manage and track your project user stories</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleValidateSelected} disabled={selectedStories.length === 0}>
            <Check className="mr-2 h-4 w-4" />
            Validate Selected ({selectedStories.length})
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New User Story
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New User Story</DialogTitle>
                <DialogDescription>Fill in the details to create a new user story for your project.</DialogDescription>
              </DialogHeader>
              <UserStoryForm onSubmit={handleCreateUserStory} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Refine your user stories view</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by title or description"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="validated">Validated</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sort By</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="justify-start" onClick={() => toggleSort("title")}>
                  Title
                  {sortField === "title" && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                  )}
                </Button>
                <Button variant="outline" size="sm" className="justify-start" onClick={() => toggleSort("updated_at")}>
                  Last Updated
                  {sortField === "updated_at" && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                  )}
                </Button>
                <Button variant="outline" size="sm" className="justify-start" onClick={() => toggleSort("status")}>
                  Status
                  {sortField === "status" && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                  )}
                </Button>
                <Button variant="outline" size="sm" className="justify-start" onClick={() => toggleSort("created_at")}>
                  Created Date
                  {sortField === "created_at" && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Overview of your user stories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{userStories.length}</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Validated</p>
                <p className="text-2xl font-bold">
                  {userStories.filter((story) => story.status === "validated").length}
                </p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">In Review</p>
                <p className="text-2xl font-bold">
                  {userStories.filter((story) => story.status === "in_review").length}
                </p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Draft</p>
                <p className="text-2xl font-bold">{userStories.filter((story) => story.status === "draft").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>User Stories List</CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={selectedStories.length === filteredUserStories.length && filteredUserStories.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="text-sm font-normal">
                Select All
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUserStories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No user stories found. Create your first one!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUserStories.map((story) => (
                <UserStoryCard
                  key={story.id}
                  story={story}
                  isSelected={selectedStories.includes(story.id)}
                  onSelect={(checked) => handleSelectStory(story.id, checked)}
                  onEdit={() => handleEditClick(story)}
                  onDelete={() => handleDeleteUserStory(story.id)}
                  onValidate={() => handleValidateUserStory(story.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User Story</DialogTitle>
            <DialogDescription>Update the details of this user story.</DialogDescription>
          </DialogHeader>
          {currentUserStory && <UserStoryForm userStory={currentUserStory} onSubmit={handleUpdateUserStory} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
