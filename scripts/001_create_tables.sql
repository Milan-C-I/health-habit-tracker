-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create habit categories enum
CREATE TYPE habit_category AS ENUM (
  'HEALTH',
  'FITNESS', 
  'NUTRITION',
  'SLEEP',
  'MINDFULNESS',
  'PRODUCTIVITY',
  'SOCIAL',
  'OTHER'
);

-- Create habit frequency enum
CREATE TYPE habit_frequency AS ENUM (
  'DAILY',
  'WEEKLY',
  'MONTHLY'
);

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category habit_category NOT NULL,
  target_value INTEGER,
  unit TEXT,
  frequency habit_frequency DEFAULT 'DAILY',
  is_active BOOLEAN DEFAULT true,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create habit_logs table
CREATE TABLE IF NOT EXISTS habit_logs (
  id TEXT PRIMARY KEY,
  value REAL NOT NULL,
  notes TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, user_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(date);
