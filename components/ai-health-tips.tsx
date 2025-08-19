"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, RefreshCw, Sparkles } from "lucide-react"

interface HealthTip {
  tip: string
  category: string
  generatedAt: string
}

export function AIHealthTips() {
  const [tip, setTip] = useState<HealthTip | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const generateTip = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/ai-tips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        setTip(data)
      } else {
        setError(data.error || "Failed to generate tip")
      }
    } catch (err) {
      setError("An error occurred while generating your health tip")
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Health: "bg-green-100 text-green-800",
      Fitness: "bg-blue-100 text-blue-800",
      Nutrition: "bg-orange-100 text-orange-800",
      Sleep: "bg-purple-100 text-purple-800",
      Mindfulness: "bg-pink-100 text-pink-800",
      Productivity: "bg-yellow-100 text-yellow-800",
      Social: "bg-indigo-100 text-indigo-800",
      General: "bg-gray-100 text-gray-800",
      "Getting Started": "bg-emerald-100 text-emerald-800",
    }
    return colors[category] || colors.General
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <CardTitle>AI Health Tips</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generateTip}
            disabled={isLoading}
            className="flex items-center gap-2 cursor-pointer bg-transparent"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isLoading ? "Generating..." : "Get New Tip"}
          </Button>
        </div>
        <CardDescription>Get personalized health recommendations based on your habit data</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!tip && !isLoading && (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Click "Get New Tip" to receive a personalized health recommendation based on your habits!
            </p>
            <Button className="cursor-pointer" onClick={generateTip} disabled={isLoading}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Your First Tip
            </Button>
          </div>
        )}

        {tip && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className={getCategoryColor(tip.category)}>{tip.category}</Badge>
              <span className="text-sm text-muted-foreground">
                Generated {new Date(tip.generatedAt).toLocaleString()}
              </span>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm leading-relaxed">{tip.tip}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
