"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { HabitForm } from "@/components/habit-form";
import { HabitCard } from "@/components/habit-card";
import type { HabitWithLogs } from "@/lib/types";

export default function HabitsPage() {
  const [habits, setHabits] = useState<HabitWithLogs[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitWithLogs | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHabits = async () => {
    try {
      const response = await fetch("/api/habits");
      if (response.ok) {
        const data = await response.json();
        setHabits(data.habits);
      }
    } catch (error) {
      console.error("Failed to fetch habits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    fetchHabits();
  };

  const handleEditSuccess = () => {
    setEditingHabit(null);
    fetchHabits();
  };

  const handleDelete = () => {
    fetchHabits();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">Loading habits...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Habits</h1>
            <p className="text-muted-foreground">
              Track and manage your daily habits
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Habit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Habit</DialogTitle>
              </DialogHeader>
              <HabitForm
                onSuccess={handleCreateSuccess}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {habits.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No habits yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building healthy habits by creating your first one!
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Habit
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onUpdate={handleEditSuccess}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
