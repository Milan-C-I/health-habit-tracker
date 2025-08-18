import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Target, TrendingUp, Calendar } from "lucide-react"
import type { DashboardStats } from "@/lib/types"

interface DashboardStatsProps {
  stats: DashboardStats
}

export function DashboardStatsCards({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: "Total Habits",
      value: stats.totalHabits,
      description: "Habits you're tracking",
      icon: Target,
      color: "text-blue-600",
    },
    {
      title: "Active Habits",
      value: stats.activeHabits,
      description: "Currently active",
      icon: Activity,
      color: "text-green-600",
    },
    {
      title: "Completed Today",
      value: stats.completedToday,
      description: "Habits logged today",
      icon: Calendar,
      color: "text-orange-600",
    },
    {
      title: "Weekly Progress",
      value: `${stats.weeklyProgress}%`,
      description: "This week's completion rate",
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
