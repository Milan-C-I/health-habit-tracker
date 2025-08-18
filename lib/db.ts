import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export { sql }

// Database helper functions
export async function createUser(email: string, name: string, password: string) {
  const id = crypto.randomUUID()
  const result = await sql`
    INSERT INTO users (id, email, name, password, created_at, updated_at)
    VALUES (${id}, ${email}, ${name}, ${password}, NOW(), NOW())
    RETURNING id, email, name, created_at, updated_at
  `
  return result[0]
}

export async function getUserByEmail(email: string) {
  const result = await sql`
    SELECT id, email, name, password, created_at, updated_at
    FROM users
    WHERE email = ${email}
  `
  return result[0] || null
}

export async function getUserById(id: string) {
  const result = await sql`
    SELECT id, email, name, created_at, updated_at
    FROM users
    WHERE id = ${id}
  `
  return result[0] || null
}

export async function createHabit(data: {
  name: string
  description?: string
  category: string
  targetValue?: number
  unit?: string
  frequency: string
  userId: string
}) {
  const id = crypto.randomUUID()
  const result = await sql`
    INSERT INTO habits (id, name, description, category, target_value, unit, frequency, user_id, created_at, updated_at)
    VALUES (${id}, ${data.name}, ${data.description || null}, ${data.category}, ${data.targetValue || null}, ${data.unit || null}, ${data.frequency}, ${data.userId}, NOW(), NOW())
    RETURNING *
  `
  return result[0]
}

export async function getHabitsByUserId(userId: string) {
  const result = await sql`
    SELECT h.*, 
           COALESCE(
             json_agg(
               json_build_object(
                 'id', hl.id,
                 'value', hl.value,
                 'notes', hl.notes,
                 'date', hl.date,
                 'createdAt', hl.created_at
               ) ORDER BY hl.date DESC
             ) FILTER (WHERE hl.id IS NOT NULL AND hl.date >= NOW() - INTERVAL '30 days'), 
             '[]'
           ) as habit_logs
    FROM habits h
    LEFT JOIN habit_logs hl ON h.id = hl.habit_id
    WHERE h.user_id = ${userId} AND h.is_active = true
    GROUP BY h.id
    ORDER BY h.created_at DESC
  `
  return result
}

export async function updateHabit(id: string, userId: string, data: any) {
  const result = await sql`
    UPDATE habits 
    SET name = COALESCE(${data.name}, name),
        description = COALESCE(${data.description}, description),
        category = COALESCE(${data.category}, category),
        target_value = COALESCE(${data.targetValue}, target_value),
        unit = COALESCE(${data.unit}, unit),
        frequency = COALESCE(${data.frequency}, frequency),
        is_active = COALESCE(${data.isActive}, is_active),
        updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING *
  `
  return result[0]
}

export async function deleteHabit(id: string, userId: string) {
  const result = await sql`
    UPDATE habits 
    SET is_active = false, updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING *
  `
  return result[0]
}

export async function createHabitLog(data: {
  value: number
  notes?: string
  date: Date
  habitId: string
  userId: string
}) {
  const id = crypto.randomUUID()

  // First try to update existing log for the same date
  const existing = await sql`
    UPDATE habit_logs 
    SET value = ${data.value}, notes = ${data.notes || null}
    WHERE habit_id = ${data.habitId} AND user_id = ${data.userId} AND DATE(date) = DATE(${data.date.toISOString()})
    RETURNING *
  `

  if (existing.length > 0) {
    return existing[0]
  }

  // Create new log if none exists
  const result = await sql`
    INSERT INTO habit_logs (id, value, notes, date, habit_id, user_id, created_at)
    VALUES (${id}, ${data.value}, ${data.notes || null}, ${data.date.toISOString()}, ${data.habitId}, ${data.userId}, NOW())
    RETURNING *
  `
  return result[0]
}

export async function getDashboardStats(userId: string) {
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const sevenDaysAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [stats, dailyLogs, categoryStats, recentHabits] = await Promise.all([
    sql`
      SELECT 
        (SELECT COUNT(*) FROM habits WHERE user_id = ${userId}) as total_habits,
        (SELECT COUNT(*) FROM habits WHERE user_id = ${userId} AND is_active = true) as active_habits,
        (SELECT COUNT(*) FROM habit_logs WHERE user_id = ${userId} AND DATE(date) = DATE(NOW())) as completed_today,
        (SELECT COUNT(*) FROM habit_logs WHERE user_id = ${userId} AND date >= ${sevenDaysAgo.toISOString()}) as weekly_logs
    `,
    sql`
      SELECT DATE(date) as date, COUNT(*) as completed
      FROM habit_logs 
      WHERE user_id = ${userId} AND date >= ${sevenDaysAgo.toISOString()}
      GROUP BY DATE(date)
      ORDER BY date
    `,
    sql`
      SELECT category, COUNT(*) as count
      FROM habits 
      WHERE user_id = ${userId} AND is_active = true
      GROUP BY category
    `,
    sql`
      SELECT h.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', hl.id,
                   'value', hl.value,
                   'notes', hl.notes,
                   'date', hl.date,
                   'createdAt', hl.created_at
                 ) ORDER BY hl.date DESC
               ) FILTER (WHERE hl.id IS NOT NULL AND hl.date >= ${sevenDaysAgo.toISOString()}), 
               '[]'
             ) as habit_logs
      FROM habits h
      LEFT JOIN habit_logs hl ON h.id = hl.habit_id
      WHERE h.user_id = ${userId} AND h.is_active = true
      GROUP BY h.id
      ORDER BY h.created_at DESC
      LIMIT 5
    `,
  ])

  const activeHabits = stats[0].active_habits
  const weeklyCompletionRate = activeHabits > 0 ? Math.round((stats[0].weekly_logs / (activeHabits * 7)) * 100) : 0

  // Process daily progress
  const dailyProgress = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split("T")[0]
    const dayLog = dailyLogs.find((log) => log.date === dateStr)
    dailyProgress.push({
      date: dateStr,
      completed: dayLog ? dayLog.completed : 0,
      total: activeHabits,
    })
  }

  return {
    stats: {
      totalHabits: stats[0].total_habits,
      activeHabits: stats[0].active_habits,
      completedToday: stats[0].completed_today,
      weeklyProgress: weeklyCompletionRate,
    },
    dailyProgress,
    categoryStats,
    recentHabits,
  }
}
