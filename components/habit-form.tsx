"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { HabitCategory, HabitFrequency, type Habit } from "@/lib/types"

interface HabitFormProps {
  habit?: Habit
  onSuccess: () => void
  onCancel: () => void
}

export function HabitForm({ habit, onSuccess, onCancel }: HabitFormProps) {
  const [name, setName] = useState(habit?.name || "")
  const [description, setDescription] = useState(habit?.description || "")
  const [category, setCategory] = useState<HabitCategory>(habit?.category || HabitCategory.HEALTH)
  const [targetValue, setTargetValue] = useState(habit?.targetValue?.toString() || "")
  const [unit, setUnit] = useState(habit?.unit || "")
  const [frequency, setFrequency] = useState<HabitFrequency>(habit?.frequency || HabitFrequency.DAILY)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const url = habit ? `/api/habits/${habit.id}` : "/api/habits"
      const method = habit ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description: description || undefined,
          category,
          targetValue: targetValue ? Number(targetValue) : undefined,
          unit: unit || undefined,
          frequency,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("successsssss")
        onSuccess()
      } else {
        console.log("faillafmaklkjass")
        setError(data.error || "Failed to save habit")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{habit ? "Edit Habit" : "Create New Habit"}</CardTitle>
        <CardDescription>{habit ? "Update your habit details" : "Add a new habit to track"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Habit Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Drink Water, Exercise, Meditate"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description of your habit"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as HabitCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(HabitCategory).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0) + cat.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetValue">Target Value</Label>
              <Input
                id="targetValue"
                type="number"
                placeholder="e.g., 8, 2000"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                min="0"
                step="0.1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                type="text"
                placeholder="e.g., hours, liters, minutes"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency *</Label>
            <Select value={frequency} onValueChange={(value) => setFrequency(value as HabitFrequency)}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(HabitFrequency).map((freq) => (
                  <SelectItem key={freq} value={freq}>
                    {freq.charAt(0) + freq.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Saving..." : habit ? "Update Habit" : "Create Habit"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
