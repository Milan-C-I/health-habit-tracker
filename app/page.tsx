import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, BarChart3, Brain, Target } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-transparent">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Health & Habit Tracker
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Build better habits, track your progress, and get AI-powered insights to improve your health and
              well-being.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg">
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Everything you need to build healthy habits
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Comprehensive tools to track, analyze, and improve your daily habits
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <Target className="h-8 w-8 text-blue-600" />
                <CardTitle>Habit Tracking</CardTitle>
                <CardDescription>
                  Create and track daily habits across multiple categories like health, fitness, and mindfulness.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-green-600" />
                <CardTitle>Progress Visualization</CardTitle>
                <CardDescription>
                  View your progress with beautiful charts and statistics to stay motivated and on track.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Brain className="h-8 w-8 text-purple-600" />
                <CardTitle>AI Health Tips</CardTitle>
                <CardDescription>
                  Get personalized health recommendations and motivational tips based on your habit data.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Activity className="h-8 w-8 text-orange-600" />
                <CardTitle>Daily Logging</CardTitle>
                <CardDescription>
                  Quick and easy daily logging with notes and progress tracking for all your habits.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-b pb-12 from-transparent via-purple-800/20 to-blue-600/40">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Ready to start your health journey?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Join thousands of users who are building better habits every day.
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/signup">Create Your Account</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
