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
          className="W-[100%] sm:w-auto sm:h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis dataKey="dateFormatted" fontSize={12} tick={{ fontSize: 12 }} interval="preserveStartEnd" />
              <YAxis domain={[0, 100]} fontSize={12} tick={{ fontSize: 12 }} width={30} />
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
                stroke="var(--chart-4)"
                strokeWidth={2}
                dot={{ fill: "var(--chart-1)", r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
