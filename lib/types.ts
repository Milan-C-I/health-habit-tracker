export interface User {
  id: string
  email: string
  name?: string
  createdAt: Date
  updatedAt: Date
}

export interface Habit {
  id: string
  name: string
  description?: string
  category: HabitCategory
  targetValue?: number
  unit?: string
  frequency: HabitFrequency
  isActive: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface HabitLog {
  id: string
  value: number
  notes?: string
  date: Date
  habitId: string
  userId: string
  createdAt: Date
}

export enum HabitCategory {
  HEALTH = "HEALTH",
  FITNESS = "FITNESS",
  NUTRITION = "NUTRITION",
  SLEEP = "SLEEP",
  MINDFULNESS = "MINDFULNESS",
  PRODUCTIVITY = "PRODUCTIVITY",
  SOCIAL = "SOCIAL",
  OTHER = "OTHER",
}

export enum HabitFrequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
}

export interface HabitWithLogs extends Habit {
  habitLogs: HabitLog[]
}

export interface DashboardStats {
  totalHabits: number
  activeHabits: number
  completedToday: number
  weeklyProgress: number
}
