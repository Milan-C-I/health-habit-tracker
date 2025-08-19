import { type NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get basic stats
    const [
      totalHabitsResult,
      activeHabitsResult,
      todayLogsResult,
      weeklyLogsResult,
    ] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM habits WHERE user_id = ${user.id}`,
      sql`SELECT COUNT(*) as count FROM habits WHERE user_id = ${user.id} AND is_active = true`,
      sql`SELECT COUNT(*) as count FROM habit_logs WHERE user_id = ${
        user.id
      } AND date >= ${today.toISOString()} AND date < ${new Date(
        today.getTime() + 24 * 60 * 60 * 1000
      ).toISOString()}`,
      sql`SELECT COUNT(*) as count FROM habit_logs WHERE user_id = ${
        user.id
      } AND date >= ${sevenDaysAgo.toISOString()}`,
    ]);

    const totalHabits = Number.parseInt(totalHabitsResult[0].count);
    const activeHabits = Number.parseInt(activeHabitsResult[0].count);
    const todayLogs = Number.parseInt(todayLogsResult[0].count);
    const weeklyLogs = Number.parseInt(weeklyLogsResult[0].count);

    // Get habit progress over last 30 days
    const habitProgress = await sql`
      SELECT hl.*, h.name, h.category, h.target_value, h.unit
      FROM habit_logs hl
      JOIN habits h ON hl.habit_id = h.id
      WHERE hl.user_id = ${
        user.id
      } AND hl.date >= ${thirtyDaysAgo.toISOString()}
      ORDER BY hl.date ASC
    `;

    // Get habits with recent logs
    const habitsWithLogs = await sql`
      SELECT h.*, 
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', hl.id,
              'date', hl.date,
              'value', hl.value,
              'notes', hl.notes
            ) ORDER BY hl.date DESC
          ) FILTER (WHERE hl.id IS NOT NULL), 
          '[]'
        ) as habit_logs
      FROM habits h
      LEFT JOIN habit_logs hl ON h.id = hl.habit_id AND hl.date >= ${sevenDaysAgo.toISOString()}
      WHERE h.user_id = ${user.id} AND h.is_active = true
      GROUP BY h.id
      LIMIT 5
    `;

    // Get category stats
    const categoryStats = await sql`
      SELECT category, COUNT(*) as count
      FROM habits
      WHERE user_id = ${user.id} AND is_active = true
      GROUP BY category
    `;

    // Process data for charts
    const dailyProgress = [];
    const dateMap = new Map();

    // Create date range for last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      dateMap.set(dateStr, {
        date: dateStr,
        completed: 0,
        total: activeHabits,
      });
    }

    // Count completed habits per day
    habitProgress.forEach((log) => {
      const dateStr = new Date(log.date).toISOString().split("T")[0];
      if (dateMap.has(dateStr)) {
        dateMap.get(dateStr).completed++;
      }
    });

    dailyProgress.push(...Array.from(dateMap.values()));

    // Calculate weekly completion rate
    const weeklyCompletionRate =
      activeHabits > 0
        ? Math.round((weeklyLogs / (activeHabits * 7)) * 100)
        : 0;

    return NextResponse.json({
      user,
      stats: {
        totalHabits,
        activeHabits,
        completedToday: todayLogs,
        weeklyProgress: weeklyCompletionRate,
      },
      dailyProgress,
      categoryStats: categoryStats.map((stat) => ({
        category: stat.category,
        count: Number.parseInt(stat.count),
      })),
      recentHabits: habitsWithLogs.map((habit) => ({
        id: habit.id,
        name: habit.name,
        description: habit.description,
        category: habit.category,
        targetValue: habit.target_value,
        unit: habit.unit,
        frequency: habit.frequency,
        isActive: habit.is_active,
        userId: habit.user_id,
        createdAt: habit.created_at,
        updatedAt: habit.updated_at,
        habitLogs: habit.habit_logs || [],
      })),
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
