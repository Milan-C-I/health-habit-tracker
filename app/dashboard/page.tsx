"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, BarChart3 } from "lucide-react"
import { DashboardStatsCards } from "@/components/dashboard-stats"
import { ProgressChart } from "@/components/progress-chart"
import { CategoryChart } from "@/components/category-chart"
import { RecentHabits } from "@/components/recent-habits"
import { AIHealthTips } from "@/components/ai-health-tips"
import type { DashboardStats, HabitWithLogs } from "@/lib/types"

interface DashboardData {
  stats: DashboardStats
  dailyProgress: Array<{
    date: string
    completed: number
    total: number
  }>
  categoryStats: Array<{
    category: string
    count: number
  }>
  recentHabits: HabitWithLogs[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/dashboard")
        if (response.ok) {
          const dashboardData = await response.json()
          setData(dashboardData)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">Failed to load dashboard data</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center flex-wrap justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mb-6">Track your health and habit progress</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/habits">
                <BarChart3 className="h-4 w-4 mr-2" />
                Manage Habits
              </Link>
            </Button>
            <Button asChild>
              <Link href="/habits">
                <Plus className="h-4 w-4 mr-2" />
                Add Habit
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <DashboardStatsCards stats={data.stats} />

        {/* AI Health Tips */}
        <AIHealthTips />

        {/* Charts Row */}
        <div className="grid  gap-6 lg:grid-cols-2">
          <ProgressChart data={data.dailyProgress} />
          <CategoryChart data={data.categoryStats} />
        </div>

        {/* Recent Habits */}
        <RecentHabits habits={data.recentHabits} />

        {/* Quick Actions */}
        {data.stats.activeHabits === 0 && (
          <div className="text-center py-12 bg-muted/50 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Welcome to your Health & Habit Tracker!</h3>
            <p className="text-muted-foreground mb-4">
              Start building healthy habits by creating your first habit to track.
            </p>
            <Button asChild>
              <Link href="/habits">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Habit
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
