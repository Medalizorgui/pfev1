"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UserStory } from "./types"

interface UserStoryFormProps {
  userStory?: UserStory
  onSubmit: (userStory: UserStory | Omit<UserStory, "id" | "created_at" | "updated_at">) => void
}

export function UserStoryForm({ userStory, onSubmit }: UserStoryFormProps) {
  const [formData, setFormData] = useState<Omit<UserStory, "created_at" | "updated_at"> & { id?: string }>({
    id: userStory?.id || "",
    project_id: userStory?.project_id || "",
    title: userStory?.title || "",
    description: userStory?.description || "",
    acceptance_criteria: userStory?.acceptance_criteria || "",
    business_rules: userStory?.business_rules || "",
    status: userStory?.status || "draft",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.project_id.trim()) {
      newErrors.project_id = "Project ID is required"
    }

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when field is edited
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="project_id">Project ID</Label>
          <Input
            id="project_id"
            value={formData.project_id}
            onChange={(e) => handleChange("project_id", e.target.value)}
            placeholder="Enter project ID"
            className={errors.project_id ? "border-red-500" : ""}
          />
          {errors.project_id && <p className="text-sm text-red-500">{errors.project_id}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="validated">Validated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Enter user story title"
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Enter user story description"
          className={`min-h-[100px] ${errors.description ? "border-red-500" : ""}`}
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="acceptance_criteria">Acceptance Criteria</Label>
        <Textarea
          id="acceptance_criteria"
          value={formData.acceptance_criteria}
          onChange={(e) => handleChange("acceptance_criteria", e.target.value)}
          placeholder="Enter acceptance criteria"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="business_rules">Business Rules</Label>
        <Textarea
          id="business_rules"
          value={formData.business_rules}
          onChange={(e) => handleChange("business_rules", e.target.value)}
          placeholder="Enter business rules"
          className="min-h-[100px]"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">{userStory ? "Update User Story" : "Create User Story"}</Button>
      </div>
    </form>
  )
}
