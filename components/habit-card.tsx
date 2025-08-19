"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Pencil, Trash2, Plus } from "lucide-react"
import type { HabitWithLogs } from "@/lib/types"

interface HabitCardProps {
  habit: HabitWithLogs
  onUpdate: () => void
  onDelete: () => void
}

export function HabitCard({ habit, onUpdate, onDelete }: HabitCardProps) {
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editName, setEditName] = useState(habit.name)
  const [editDescription, setEditDescription] = useState(habit.description || "")
  const [editCategory, setEditCategory] = useState(habit.category)
  const [editTargetValue, setEditTargetValue] = useState(habit.targetValue?.toString() || "")
  const [editUnit, setEditUnit] = useState(habit.unit || "")
  const [editFrequency, setEditFrequency] = useState(habit.frequency)
  const [logValue, setLogValue] = useState("")
  const [logNotes, setLogNotes] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const todayLog = habit.habitLogs.find((log) => new Date(log.date).toDateString() === new Date().toDateString())

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/habits/${habit.id}/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value: Number(logValue),
          notes: logNotes || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("sucesssssss")
        setIsLogDialogOpen(false)
        setLogValue("")
        setLogNotes("")
        onUpdate()
      } else {
        console.log("failurreeeee")
        setError(data.error || "Failed to log habit")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/habits/${habit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName,
          description: editDescription || undefined,
          category: editCategory,
          targetValue: editTargetValue ? Number(editTargetValue) : undefined,
          unit: editUnit || undefined,
          frequency: editFrequency,
          isActive: habit.isActive,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("sucesssssss")
        setIsEditDialogOpen(false)
        onUpdate()
      } else {
        console.log("failurreeeee")
        setError(data.error || "Failed to update habit")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this habit?")) return

    try {
      const response = await fetch(`/api/habits/${habit.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onDelete()
      } else {
        const data = await response.json()
        console.error("Failed to delete habit:", data.error)
        alert("Failed to delete habit: " + (data.error || "Unknown error"))
      }
    } catch (err) {
      console.error("Failed to delete habit:", err)
      alert("Failed to delete habit. Please try again.")
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      HEALTH: "bg-green-100 text-green-800",
      FITNESS: "bg-blue-100 text-blue-800",
      NUTRITION: "bg-orange-100 text-orange-800",
      SLEEP: "bg-purple-100 text-purple-800",
      MINDFULNESS: "bg-pink-100 text-pink-800",
      PRODUCTIVITY: "bg-yellow-100 text-yellow-800",
      SOCIAL: "bg-indigo-100 text-indigo-800",
      OTHER: "bg-gray-100 text-gray-800",
    }
    return colors[category as keyof typeof colors] || colors.OTHER
  }

  return (
    <Card className="w-full flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-start  justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{habit.name}</CardTitle>
            {habit.description && <CardDescription className="text-sm">{habit.description}</CardDescription>}
          </div>
          <div className="flex gap-1">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button className="cursor-pointer" variant="ghost" size="sm">
                  <Pencil className="h-4 text-yellow-400 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit {habit.name}</DialogTitle>
                  <DialogDescription>Update your habit details</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Name *</Label>
                    <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-target">Target Value</Label>
                      <Input
                        id="edit-target"
                        type="number"
                        value={editTargetValue}
                        onChange={(e) => setEditTargetValue(e.target.value)}
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-unit">Unit</Label>
                      <Input
                        id="edit-unit"
                        value={editUnit}
                        onChange={(e) => setEditUnit(e.target.value)}
                        placeholder="e.g., glasses, minutes"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? "Updating..." : "Update Habit"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Button className="cursor-pointer" variant="ghost" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 text-red-500 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={getCategoryColor(habit.category)}>
            {habit.category.charAt(0) + habit.category.slice(1).toLowerCase()}
          </Badge>
          <Badge variant="outline">{habit.frequency.toLowerCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {habit.targetValue && (
            <div className="text-sm text-muted-foreground">
              Target: {habit.targetValue} {habit.unit}
            </div>
          )}

          {todayLog ? (
            <div className="p-3 bg-purple-100 rounded-lg border border-purple-200">
              <div className="text-sm font-medium text-purple-800">
                Logged today: {todayLog.value} {habit.unit}
              </div>
              {todayLog.notes && <div className="text-sm text-green-600 mt-1">{todayLog.notes}</div>}
            </div>
          ) : (
            <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full cursor-pointer" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Log Today
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log {habit.name}</DialogTitle>
                  <DialogDescription>Record your progress for today</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleLogSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="value">Value {habit.unit && `(${habit.unit})`} *</Label>
                    <Input
                      id="value"
                      type="number"
                      placeholder={`e.g., ${habit.targetValue || "1"}`}
                      value={logValue}
                      onChange={(e) => setLogValue(e.target.value)}
                      required
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional notes..."
                      value={logNotes}
                      onChange={(e) => setLogNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1 cursor-pointer" disabled={isLoading}>
                      {isLoading ? "Logging..." : "Log Progress"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsLogDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
