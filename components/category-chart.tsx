"use client"

import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface CategoryData {
  category: string
  count: number
}

interface CategoryChartProps {
  data: CategoryData[]
}

export function CategoryChart({ data }: CategoryChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    categoryFormatted: item.category.charAt(0) + item.category.slice(1).toLowerCase(),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Habits by Category</CardTitle>
        <CardDescription>Distribution of your habits across different categories</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: "Number of Habits",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="W-[100%] sm:w-auto sm:h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="categoryFormatted" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`var(--chart-${index + 1})`} // pick a CSS variable or static color
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
