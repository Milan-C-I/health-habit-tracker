import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"
import { z } from "zod"
import { HabitCategory, HabitFrequency } from "@/lib/types"
import  crypto  from "crypto"

const createHabitSchema = z.object({
  name: z.string().min(1, "Habit name is required"),
  description: z.string().optional(),
  category: z.nativeEnum(HabitCategory),
  targetValue: z.number().positive().optional(),
  unit: z.string().optional(),
  frequency: z.nativeEnum(HabitFrequency).default(HabitFrequency.DAILY),
})

function generateId() {
  return crypto.randomUUID()
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const habits = await sql`
      SELECT 
        h.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', hl.id,
              'date', hl.date,
              'value', hl.value,
              'notes', hl.notes,
              'createdAt', hl.created_at
            ) ORDER BY hl.date DESC
          ) FILTER (WHERE hl.id IS NOT NULL), 
          '[]'::json
        ) as habit_logs
      FROM habits h
      LEFT JOIN habit_logs hl ON h.id = hl.habit_id 
        AND hl.date >= CURRENT_DATE - INTERVAL '30 days'
      WHERE h.user_id = ${user.id} AND h.is_active = true
      GROUP BY h.id
      ORDER BY h.created_at DESC
    `

    const formattedHabits = habits.map((habit) => ({
      ...habit,
      habitLogs: habit.habit_logs || [],
    }))

    return NextResponse.json({ habits: formattedHabits })
  } catch (error) {
    console.error("Get habits error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    const body = await request.json()
    const { name, description, category, targetValue, unit, frequency } = createHabitSchema.parse(body)

    const habitId = generateId()

    const [habit] = await sql`
      INSERT INTO habits (id, name, description, category, target_value, unit, frequency, user_id)
      VALUES (${habitId}, ${name}, ${description || null}, ${category}, ${targetValue || null}, ${unit || null}, ${frequency}, ${user.id})
      RETURNING *
    `

    return NextResponse.json({ habit }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("Create habit error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
