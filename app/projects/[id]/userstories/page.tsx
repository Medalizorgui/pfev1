"use client"

import { useState, useEffect } from "react"
import { Plus, Check, ArrowLeft, FolderPlus, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { UserStoryForm } from "@/app/user-stories/user-story-form"
import { UserStoryCard } from "@/app/user-stories/user-story-card"
import type { UserStory } from "@/app/user-stories/types"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

function GenerateTestCasesButton({ validatedStories, selectedStories }: { validatedStories: UserStory[], selectedStories: string[] }) {
  const params = useParams();
  const projectId = params.id as string;
  const [isExistingDialogOpen, setIsExistingDialogOpen] = useState(false);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [selectedTestSuite, setSelectedTestSuite] = useState<string>("");
  const [newTestSuiteName, setNewTestSuiteName] = useState("");
  const [newTestSuiteDescription, setNewTestSuiteDescription] = useState("");
  const [testSuites, setTestSuites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ title: string; description: string; variant?: "default" | "destructive" } | null>(null);
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set());
  const [selectedParentSuite, setSelectedParentSuite] = useState<string | null>(null);

  // Filter selected stories to only include validated ones
  const selectedValidatedStories = validatedStories.filter(story => selectedStories.includes(story.id));

  useEffect(() => {
    const fetchTestSuites = async () => {
      try {
        const response = await fetch(`/api/test-suites?project_id=${projectId}&include_children=true`);
        if (!response.ok) {
          throw new Error('Failed to fetch test suites');
        }
        const data = await response.json();
        console.log('Fetched test suites:', data);
        setTestSuites(data);
      } catch (error) {
        console.error('Error fetching test suites:', error);
        setAlert({
          title: "Error",
          description: "Failed to fetch test suites. Please try again later.",
          variant: "destructive"
        });
      }
    };

    if (projectId) {
      fetchTestSuites();
    }
  }, [projectId]);

  const getChildSuites = (suiteId: string) => {
    return testSuites.filter(suite => suite.parent_suite_id === suiteId);
  };

  const handleSuiteSelect = (suiteId: string) => {
    setSelectedTestSuite(suiteId);
    const newExpanded = new Set(expandedSuites);
    if (!newExpanded.has(suiteId)) {
      newExpanded.add(suiteId);
    }
    setExpandedSuites(newExpanded);
  };

  const renderTestSuite = (suite: any, level: number = 0, isForNewSuite: boolean = false) => {
    const childSuites = getChildSuites(suite.id);
    const hasChildren = childSuites.length > 0;
    const isExpanded = expandedSuites.has(suite.id);
    const isParent = !suite.parent_suite_id;

    if (!isParent && !expandedSuites.has(suite.parent_suite_id)) {
      return null;
    }

    const isSelected = isForNewSuite 
      ? selectedParentSuite === suite.id
      : selectedTestSuite === suite.id;

    return (
      <div key={suite.id} className="space-y-1">
        <div 
          className={`flex items-center gap-2 py-1 px-2 rounded-md hover:bg-accent cursor-pointer ${isSelected ? 'bg-accent' : ''}`}
          onClick={() => {
            if (isForNewSuite) {
              setSelectedParentSuite(suite.id);
            } else {
              handleSuiteSelect(suite.id);
            }
          }}
        >
          <div style={{ marginLeft: `${level * 1.5}rem` }} className="flex items-center gap-2">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newExpanded = new Set(expandedSuites);
                  if (newExpanded.has(suite.id)) {
                    newExpanded.delete(suite.id);
                  } else {
                    newExpanded.add(suite.id);
                  }
                  setExpandedSuites(newExpanded);
                }}
                className="p-1 hover:bg-accent rounded-md"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            )}
            <span className="flex-1">{suite.name}</span>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {childSuites.map(child => renderTestSuite(child, level + 1, isForNewSuite))}
          </div>
        )}
      </div>
    );
  };

  const sendToN8nWorkflow = async (testSuiteId: string, isNewSuite: boolean = false) => {
    try {
      setIsLoading(true);
      
      // Prepare the data to send to n8n
      const workflowData = {
        project_id: projectId,
        test_suite_id: testSuiteId,
        is_new_suite: isNewSuite,
        user_stories: selectedValidatedStories.map(story => ({
          id: story.id,
          title: story.title,
          description: story.description,
          acceptance_criteria: story.acceptance_criteria,
          business_rules: story.business_rules
        })),
        test_suite_info: isNewSuite ? {
          name: newTestSuiteName,
          description: newTestSuiteDescription,
          parent_suite_id: selectedParentSuite
        } : {
          name: testSuites.find(suite => suite.id === testSuiteId)?.name,
          parent_suite_id: testSuites.find(suite => suite.id === testSuiteId)?.parent_suite_id
        }
      };

      // Send to n8n workflow
      const response = await fetch('http://localhost:5678/webhook-test/api/n8n/generate-test-cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowData),
      });

      if (!response.ok) {
        throw new Error('Failed to send data to n8n workflow');
      }

      setAlert({
        title: "Success",
        description: "Test case generation request has been sent successfully",
      });

      // Close the appropriate dialog
      if (isNewSuite) {
        setIsNewDialogOpen(false);
        setNewTestSuiteName("");
        setNewTestSuiteDescription("");
        setSelectedParentSuite(null);
      } else {
        setIsExistingDialogOpen(false);
      }
    } catch (error) {
      console.error('Error sending data to n8n workflow:', error);
      setAlert({
        title: "Error",
        description: "Failed to send data to n8n workflow. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInExisting = async () => {
    if (!selectedTestSuite) {
      setAlert({
        title: "Error",
        description: "Please select a test suite",
        variant: "destructive"
      });
      return;
    }

    await sendToN8nWorkflow(selectedTestSuite);
  };

  const handleGenerateInNew = async () => {
    if (!newTestSuiteName) {
      setAlert({
        title: "Error",
        description: "Please enter a test suite name",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      // First create the test suite
      const createResponse = await fetch('/api/test-suites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          name: newTestSuiteName,
          description: newTestSuiteDescription,
          parent_suite_id: selectedParentSuite
        }),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create test suite');
      }

      const newTestSuite = await createResponse.json();
      await sendToN8nWorkflow(newTestSuite.id, true);
    } catch (error) {
      console.error('Error creating test suite:', error);
      setAlert({
        title: "Error",
        description: "Failed to create test suite. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Only show the button if there are selected validated stories
  if (selectedValidatedStories.length === 0) {
    return null;
  }

  return (
    <>
      {alert && (
        <Alert className="mb-4" variant={alert.variant}>
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>{alert.description}</AlertDescription>
        </Alert>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Generate Test Cases ({selectedValidatedStories.length})
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => {
            console.log('Opening existing dialog, current test suites:', testSuites);
            setIsExistingDialogOpen(true);
          }}>
            <FolderPlus className="mr-2 h-4 w-4" />
            Generate in Existing Test Suite
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            console.log('Opening new dialog, current test suites:', testSuites);
            setIsNewDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Test Suite and Generate
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog for existing test suites */}
      <Dialog open={isExistingDialogOpen} onOpenChange={setIsExistingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate in Existing Test Suite</DialogTitle>
            <DialogDescription>
              Select an existing test suite to generate test cases for the validated user stories.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Test Suite</Label>
              <div className="border rounded-md p-2 max-h-[200px] overflow-y-auto">
                {testSuites.length === 0 ? (
                  <div className="text-center py-2 text-muted-foreground">No test suites found</div>
                ) : (
                  testSuites
                    .filter(suite => !suite.parent_suite_id)
                    .map(suite => renderTestSuite(suite, 0, false))
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExistingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateInExisting} disabled={isLoading || !selectedTestSuite}>
              {isLoading ? "Generating..." : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for new test suite */}
      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Test Suite</DialogTitle>
            <DialogDescription>
              Create a new test suite and generate test cases for the validated user stories.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newTestSuiteName}
                onChange={(e) => setNewTestSuiteName(e.target.value)}
                placeholder="Enter test suite name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTestSuiteDescription}
                onChange={(e) => setNewTestSuiteDescription(e.target.value)}
                placeholder="Enter test suite description"
              />
            </div>
            <div className="space-y-2">
              <Label>Parent Test Suite (Optional)</Label>
              <div className="border rounded-md p-2 max-h-[200px] overflow-y-auto">
                <div 
                  className={`flex items-center gap-2 py-1 px-2 rounded-md hover:bg-accent cursor-pointer ${!selectedParentSuite ? 'bg-accent' : ''}`}
                  onClick={() => setSelectedParentSuite(null)}
                >
                  <span>Root Level (No Parent)</span>
                </div>
                {testSuites
                  .filter(suite => !suite.parent_suite_id)
                  .map(suite => renderTestSuite(suite, 0, true))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateInNew} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create and Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function UserStoriesPage() {
  const params = useParams()
  const projectId = params.id as string
  
  const [userStories, setUserStories] = useState<UserStory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStories, setSelectedStories] = useState<string[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentUserStory, setCurrentUserStory] = useState<UserStory | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<string>("updated_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [alert, setAlert] = useState<{ title: string; description: string; variant?: "default" | "destructive" } | null>(null)
  const [activeTab, setActiveTab] = useState<"on_hold" | "validated">("on_hold")

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
        story.project_id === projectId &&
        story.status === activeTab &&
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

  const handleCreateUserStory = async (newUserStory: Omit<UserStory, "id" | "created_at" | "updated_at">) => {
    try {
      const response = await fetch('/api/user-stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUserStory),
      })

      if (!response.ok) {
        throw new Error('Failed to create user story')
      }

      const createdStory = await response.json()
      setUserStories([...userStories, createdStory])
      setIsCreateDialogOpen(false)
      setAlert({
        title: "User Story Created",
        description: "The user story has been successfully created.",
      })
    } catch (error) {
      console.error('Error creating user story:', error)
      setAlert({
        title: "Error",
        description: "Failed to create user story. Please try again later.",
        variant: "destructive"
      })
    }
  }

  const handleUpdateUserStory = async (updatedUserStory: UserStory | Omit<UserStory, "id" | "created_at" | "updated_at">) => {
    if (!('id' in updatedUserStory)) {
      return
    }

    try {
      const response = await fetch('/api/user-stories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUserStory),
      })

      if (!response.ok) {
        throw new Error('Failed to update user story')
      }

      const updatedStory = await response.json()
      setUserStories(
        userStories.map((story) =>
          story.id === updatedStory.id ? updatedStory : story,
        ),
      )
      setIsEditDialogOpen(false)
      setCurrentUserStory(null)
      setAlert({
        title: "User Story Updated",
        description: "The user story has been successfully updated.",
      })
    } catch (error) {
      console.error('Error updating user story:', error)
      setAlert({
        title: "Error",
        description: "Failed to update user story. Please try again later.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteUserStory = async (id: string) => {
    try {
      const response = await fetch(`/api/user-stories?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete user story')
      }

      setUserStories(userStories.filter((story) => story.id !== id))
      setSelectedStories(selectedStories.filter((storyId) => storyId !== id))
      setAlert({
        title: "User Story Deleted",
        description: "The user story has been successfully deleted.",
      })
    } catch (error) {
      console.error('Error deleting user story:', error)
      setAlert({
        title: "Error",
        description: "Failed to delete user story. Please try again later.",
        variant: "destructive"
      })
    }
  }

  const handleValidateUserStory = async (id: string) => {
    try {
      const story = userStories.find(s => s.id === id)
      if (!story) return

      const response = await fetch('/api/user-stories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...story,
          status: 'validated',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to validate user story')
      }

      const updatedStory = await response.json()
      setUserStories(
        userStories.map((story) =>
          story.id === updatedStory.id ? updatedStory : story,
        ),
      )
      setAlert({
        title: "User Story Validated",
        description: "The user story has been marked as validated.",
      })
    } catch (error) {
      console.error('Error validating user story:', error)
      setAlert({
        title: "Error",
        description: "Failed to validate user story. Please try again later.",
        variant: "destructive"
      })
    }
  }

  const handleValidateSelected = async () => {
    if (selectedStories.length === 0) {
      setAlert({
        title: "No Stories Selected",
        description: "Please select at least one user story to validate.",
        variant: "destructive",
      })
      return
    }

    try {
      const validationPromises = selectedStories.map(id => {
        const story = userStories.find(s => s.id === id)
        if (!story) return null

        return fetch('/api/user-stories', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...story,
            status: 'validated',
          }),
        })
      })

      const responses = await Promise.all(validationPromises.filter(Boolean))
      const allSuccessful = responses.every(response => response?.ok)

      if (!allSuccessful) {
        throw new Error('Failed to validate some user stories')
      }

      const updatedStories = await Promise.all(
        responses.map(response => response?.json())
      )

      setUserStories(
        userStories.map((story) => {
          const updatedStory = updatedStories.find(s => s.id === story.id)
          return updatedStory || story
        }),
      )
      setAlert({
        title: "User Stories Validated",
        description: `${selectedStories.length} user stories have been marked as validated.`,
      })
      setSelectedStories([])
    } catch (error) {
      console.error('Error validating user stories:', error)
      setAlert({
        title: "Error",
        description: "Failed to validate user stories. Please try again later.",
        variant: "destructive"
      })
    }
  }

  const handleSelectStory = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedStories([...selectedStories, id])
    } else {
      setSelectedStories(selectedStories.filter((storyId) => storyId !== id))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    const storiesToSelect = filteredUserStories.filter(story => 
      activeTab === "validated" ? story.status === "validated" : story.status === "on_hold"
    );
    
    if (checked) {
      setSelectedStories([...new Set([...selectedStories, ...storiesToSelect.map(story => story.id)])]);
    } else {
      setSelectedStories(selectedStories.filter(id => 
        !storiesToSelect.some(story => story.id === id)
      ));
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

  const validatedStories = userStories.filter(story => story.status === "validated");

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
            <Link href={`/projects/${projectId}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to project
            </Link>
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
          <GenerateTestCasesButton 
            validatedStories={validatedStories} 
            selectedStories={selectedStories} 
          />
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
              <UserStoryForm 
                onSubmit={handleCreateUserStory} 
                userStory={{ project_id: projectId, status: "on_hold" } as UserStory} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search user stories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as "on_hold" | "validated")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="on_hold">On Hold</TabsTrigger>
          <TabsTrigger value="validated">Validated</TabsTrigger>
        </TabsList>
        <TabsContent value="on_hold" className="mt-4">
          <div className="grid gap-4">
            <div className="flex items-center gap-2 mb-2">
              <Checkbox
                id="select-all-on-hold"
                checked={filteredUserStories.filter(story => story.status === "on_hold").every(story => selectedStories.includes(story.id))}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all-on-hold" className="text-sm font-normal">
                Select All On Hold
              </Label>
            </div>
            {isLoading ? (
              <div className="text-center py-8">Loading user stories...</div>
            ) : filteredUserStories.filter(story => story.status === "on_hold").length === 0 ? (
              <div className="text-center py-8">No on hold user stories found.</div>
            ) : (
              filteredUserStories
                .filter(story => story.status === "on_hold")
                .map((story) => (
                  <UserStoryCard
                    key={story.id}
                    story={story}
                    onEdit={() => handleEditClick(story)}
                    onDelete={() => handleDeleteUserStory(story.id)}
                    onValidate={() => handleValidateUserStory(story.id)}
                    onSelect={(checked) => handleSelectStory(story.id, checked)}
                    isSelected={selectedStories.includes(story.id)}
                  />
                ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="validated" className="mt-4">
          <div className="grid gap-4">
            <div className="flex items-center gap-2 mb-2">
              <Checkbox
                id="select-all-validated"
                checked={filteredUserStories.filter(story => story.status === "validated").every(story => selectedStories.includes(story.id))}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all-validated" className="text-sm font-normal">
                Select All Validated
              </Label>
            </div>
            {isLoading ? (
              <div className="text-center py-8">Loading user stories...</div>
            ) : filteredUserStories.filter(story => story.status === "validated").length === 0 ? (
              <div className="text-center py-8">No validated user stories found.</div>
            ) : (
              filteredUserStories
                .filter(story => story.status === "validated")
                .map((story) => (
                  <UserStoryCard
                    key={story.id}
                    story={story}
                    onEdit={() => handleEditClick(story)}
                    onDelete={() => handleDeleteUserStory(story.id)}
                    onValidate={() => handleValidateUserStory(story.id)}
                    onSelect={(checked) => handleSelectStory(story.id, checked)}
                    isSelected={selectedStories.includes(story.id)}
                  />
                ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User Story</DialogTitle>
            <DialogDescription>Update the details of your user story.</DialogDescription>
          </DialogHeader>
          {currentUserStory && (
            <UserStoryForm
              onSubmit={handleUpdateUserStory}
              userStory={currentUserStory}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 