import bcrypt from "bcryptjs"
import { getUserById } from "./db"

export interface AuthUser {
  id: string
  email: string
  name?: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: AuthUser): string {
  const payload = {
    userId: user.id,
    email: user.email,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  }
  return Buffer.from(JSON.stringify(payload)).toString("base64")
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString("utf8"))

    // Check if token is expired
    if (Date.now() > payload.exp) {
      return null
    }

    return { id: payload.userId, email: payload.email }
  } catch {
    return null
  }
}

export async function getUserFromToken(token: string): Promise<AuthUser | null> {
  const decoded = verifyToken(token)
  if (!decoded) return null

  const user = await getUserById(decoded.id)
  if (!user) return null

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  }
}
