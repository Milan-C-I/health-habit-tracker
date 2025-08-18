import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"
import { z } from "zod"
import { HabitCategory, HabitFrequency } from "@/lib/types"

const updateHabitSchema = z.object({
  name: z.string().min(1, "Habit name is required").optional(),
  description: z.string().optional(),
  category: z.nativeEnum(HabitCategory).optional(),
  targetValue: z.number().positive().optional(),
  unit: z.string().optional(),
  frequency: z.nativeEnum(HabitFrequency).optional(),
  isActive: z.boolean().optional(),
})

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] PUT /api/habits/[id] - Starting update for habit:", params.id)

    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      console.log("[v0] PUT /api/habits/[id] - No auth token found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      console.log("[v0] PUT /api/habits/[id] - Invalid auth token")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] PUT /api/habits/[id] - User authenticated:", user.id)

    const body = await request.json()
    console.log("[v0] PUT /api/habits/[id] - Request body:", body)

    const updateData = updateHabitSchema.parse(body)
    console.log("[v0] PUT /api/habits/[id] - Validated update data:", updateData)

    const existingHabit = await sql`
      SELECT id FROM habits 
      WHERE id = ${params.id} AND user_id = ${user.id}
    `

    if (existingHabit.length === 0) {
      console.log("[v0] PUT /api/habits/[id] - Habit not found for user")
      return NextResponse.json({ error: "Habit not found" }, { status: 404 })
    }

    const habit = await sql`
      UPDATE habits 
      SET 
        name = COALESCE(${updateData.name}, name),
        description = COALESCE(${updateData.description}, description),
        category = COALESCE(${updateData.category}, category),
        target_value = COALESCE(${updateData.targetValue}, target_value),
        unit = COALESCE(${updateData.unit}, unit),
        frequency = COALESCE(${updateData.frequency}, frequency),
        is_active = COALESCE(${updateData.isActive}, is_active),
        updated_at = NOW()
      WHERE id = ${params.id} AND user_id = ${user.id}
      RETURNING *
    `

    console.log("[v0] PUT /api/habits/[id] - Updated habit:", habit[0])
    return NextResponse.json({ habit: habit[0] })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log("[v0] PUT /api/habits/[id] - Validation error:", error.errors)
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("[v0] PUT /api/habits/[id] - Update habit error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] DELETE /api/habits/[id] - Starting delete for habit:", params.id)

    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      console.log("[v0] DELETE /api/habits/[id] - No auth token found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      console.log("[v0] DELETE /api/habits/[id] - Invalid auth token")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] DELETE /api/habits/[id] - User authenticated:", user.id)

    const existingHabit = await sql`
      SELECT id FROM habits 
      WHERE id = ${params.id} AND user_id = ${user.id}
    `

    if (existingHabit.length === 0) {
      console.log("[v0] DELETE /api/habits/[id] - Habit not found for user")
      return NextResponse.json({ error: "Habit not found" }, { status: 404 })
    }

    await sql`DELETE FROM habit_logs WHERE habit_id = ${params.id} AND user_id = ${user.id}`
    await sql`DELETE FROM habits WHERE id = ${params.id} AND user_id = ${user.id}`

    console.log("[v0] DELETE /api/habits/[id] - Habit and logs deleted successfully")
    return NextResponse.json({ message: "Habit deleted successfully" })
  } catch (error) {
    console.error("[v0] DELETE /api/habits/[id] - Delete habit error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
