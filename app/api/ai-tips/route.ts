import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { sql } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's habits and recent logs
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const habitsResult = await sql`
      SELECT 
        h.id,
        h.name,
        h.category,
        h.target_value as "targetValue",
        h.unit,
        h.frequency,
        COALESCE(
          json_agg(
            json_build_object(
              'id', hl.id,
              'value', hl.value,
              'date', hl.date
            ) ORDER BY hl.date DESC
          ) FILTER (WHERE hl.id IS NOT NULL), 
          '[]'::json
        ) as habit_logs
      FROM habits h
      LEFT JOIN habit_logs hl ON h.id = hl.habit_id 
        AND hl.user_id = ${user.id}
        AND hl.date >= ${sevenDaysAgo}
      WHERE h.user_id = ${user.id} 
        AND h.is_active = true
      GROUP BY h.id, h.name, h.category, h.target_value, h.unit, h.frequency
    `

    if (habitsResult.length === 0) {
      return NextResponse.json({
        tip: "Welcome to your health journey! Start by creating your first habit to track. Consider beginning with simple habits like drinking 8 glasses of water daily or taking a 10-minute walk.",
        category: "Getting Started",
      })
    }

    // Analyze habit data
    const habitSummary = habitsResult.map((habit: any) => {
      const habitLogs = Array.isArray(habit.habit_logs) ? habit.habit_logs : []
      const recentLogs = habitLogs.slice(0, 7)
      const completionRate = recentLogs.length / 7
      const averageValue =
        recentLogs.length > 0 ? recentLogs.reduce((sum: number, log: any) => sum + log.value, 0) / recentLogs.length : 0

      return {
        name: habit.name,
        category: habit.category.toLowerCase(),
        targetValue: habit.targetValue,
        unit: habit.unit,
        completionRate: Math.round(completionRate * 100),
        averageValue: Math.round(averageValue * 10) / 10,
        frequency: habit.frequency.toLowerCase(),
      }
    })

    // Create prompt for AI
    const habitData = habitSummary
      .map(
        (h) =>
          `- ${h.name} (${h.category}): ${h.completionRate}% completion rate this week` +
          (h.targetValue
            ? `, averaging ${h.averageValue} ${h.unit || "units"} (target: ${h.targetValue} ${h.unit || "units"})`
            : ""),
      )
      .join("\n")

    const prompt = `You are a friendly health assistant. The user has the following habit data from the past week:

${habitData}

Based on this data, generate a personalized, encouraging health tip for today. The tip should be:
- Specific and actionable
- Motivational and positive
- 1-2 sentences maximum
- Focused on improvement or maintaining good progress
- Consider their completion rates and performance

If they're doing well, encourage them to keep going. If they're struggling, provide gentle motivation and practical suggestions.`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      maxOutputTokens: 150,
    })

    // Determine tip category based on habits
    const categories = habitSummary.map((h) => h.category)
    const mostCommonCategory = categories.reduce((a, b, i, arr) =>
      arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length ? a : b,
    )

    const categoryMap: Record<string, string> = {
      health: "Health",
      fitness: "Fitness",
      nutrition: "Nutrition",
      sleep: "Sleep",
      mindfulness: "Mindfulness",
      productivity: "Productivity",
      social: "Social",
      other: "General",
    }

    return NextResponse.json({
      tip: text.trim(),
      category: categoryMap[mostCommonCategory] || "General",
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("AI tips error:", error)
    return NextResponse.json({ error: "Failed to generate health tip" }, { status: 500 })
  }
}
