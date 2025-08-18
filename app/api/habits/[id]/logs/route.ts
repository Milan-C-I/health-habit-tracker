import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"
import { z } from "zod"
import crypto from "crypto"

const createLogSchema = z.object({
  value: z.number().positive("Value must be positive"),
  notes: z.string().optional(),
  date: z.string().optional(),
})

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] POST /api/habits/[id]/logs - Starting log creation for habit:", params.id)

    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      console.log("[v0] POST /api/habits/[id]/logs - No auth token found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      console.log("[v0] POST /api/habits/[id]/logs - Invalid auth token")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] POST /api/habits/[id]/logs - User authenticated:", user.id)

    const body = await request.json()
    console.log("[v0] POST /api/habits/[id]/logs - Request body:", body)

    const { value, notes, date } = createLogSchema.parse(body)
    console.log("[v0] POST /api/habits/[id]/logs - Validated data:", { value, notes, date })

    const habit = await sql`
      SELECT id FROM habits 
      WHERE id = ${params.id} AND user_id = ${user.id} AND is_active = true
    `

    if (habit.length === 0) {
      console.log("[v0] POST /api/habits/[id]/logs - Habit not found or inactive")
      return NextResponse.json({ error: "Habit not found" }, { status: 404 })
    }

    const logDate = date ? new Date(date) : new Date()
    // Set to start of day to avoid timezone issues
    logDate.setHours(0, 0, 0, 0)
    const logDateString = logDate.toISOString()
    console.log("[v0] POST /api/habits/[id]/logs - Log date:", logDateString)

    const existingLog = await sql`
      SELECT id FROM habit_logs 
      WHERE habit_id = ${params.id} 
        AND user_id = ${user.id} 
        AND date::date = ${logDateString}::date
    `

    console.log("[v0] POST /api/habits/[id]/logs - Existing log check:", existingLog.length > 0 ? "Found" : "Not found")

    let habitLog
    if (existingLog.length > 0) {
      console.log("[v0] POST /api/habits/[id]/logs - Updating existing log:", existingLog[0].id)
      habitLog = await sql`
        UPDATE habit_logs 
        SET value = ${value}, notes = ${notes || null}
        WHERE id = ${existingLog[0].id}
        RETURNING *
      `
    } else {
      const logId = crypto.randomUUID()
      console.log("[v0] POST /api/habits/[id]/logs - Creating new log with ID:", logId)
      habitLog = await sql`
        INSERT INTO habit_logs (id, value, notes, date, habit_id, user_id, created_at)
        VALUES (${logId}, ${value}, ${notes || null}, ${logDateString}, ${params.id}, ${user.id}, NOW())
        RETURNING *
      `
    }

    console.log("[v0] POST /api/habits/[id]/logs - Log operation successful:", habitLog[0])
    return NextResponse.json({ habitLog: habitLog[0] }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log("[v0] POST /api/habits/[id]/logs - Validation error:", error.errors)
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("[v0] POST /api/habits/[id]/logs - Create habit log error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
