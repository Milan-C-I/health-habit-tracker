"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ProgressData {
  date: string
  completed: number
  total: number
}

interface ProgressChartProps {
  data: ProgressData[]
}

export function ProgressChart({ data }: ProgressChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    completionRate: item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0,
    dateFormatted: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Progress</CardTitle>
        <CardDescription>Your habit completion rate over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            completionRate: {
              label: "Completion Rate",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="dateFormatted" />
              <YAxis domain={[0, 100]} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [`${value}%`, name === "completionRate" ? "Completion Rate" : name]}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="completionRate"
                stroke="var(--color-completionRate)"
                strokeWidth={2}
                dot={{ fill: "var(--color-completionRate)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
