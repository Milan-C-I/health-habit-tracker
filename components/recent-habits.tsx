import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle } from "lucide-react"
import type { HabitWithLogs } from "@/lib/types"

interface RecentHabitsProps {
  habits: HabitWithLogs[]
}

export function RecentHabits({ habits }: RecentHabitsProps) {
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

  const isLoggedToday = (habit: HabitWithLogs) => {
    const today = new Date().toDateString()
    const logs = habit.habitLogs || []
    return Array.isArray(logs) && logs.some((log) => new Date(log.date).toDateString() === today)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Habits</CardTitle>
        <CardDescription>Your most recently created habits and today's status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {habits.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No habits found. Create your first habit!</p>
          ) : (
            habits.map((habit) => {
              const loggedToday = isLoggedToday(habit)
              return (
                <div key={habit.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {loggedToday ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <div className="font-medium">{habit.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {habit.targetValue && `Target: ${habit.targetValue} ${habit.unit}`}
                      </div>
                    </div>
                  </div>
                  <Badge className={getCategoryColor(habit.category)}>
                    {habit.category.charAt(0) + habit.category.slice(1).toLowerCase()}
                  </Badge>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
