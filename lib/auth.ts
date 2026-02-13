import { cookies } from "next/headers"
import { users, passwords } from "./mock-data"
import type { User } from "./types"

const SESSION_KEY = "castpro_session"

/**
 * Authentication — cookie-based session for the built-in mock data layer.
 * When you switch to the FastAPI backend, the frontend uses JWT tokens
 * stored in localStorage via lib/api-client.ts instead. The cookie-based
 * session here still handles SSR redirects and layout auth guards.
 */

export async function authenticate(email: string, password: string): Promise<User | null> {
  const storedPassword = passwords[email]
  if (!storedPassword || storedPassword !== password) return null
  const user = users.find((u) => u.email === email && u.isActive)
  return user ?? null
}

export async function createSession(user: User) {
  const jar = await cookies()
  jar.set(SESSION_KEY, JSON.stringify({ id: user.id, email: user.email, role: user.role, name: user.name }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  })
}

export async function getSession(): Promise<User | null> {
  const jar = await cookies()
  const raw = jar.get(SESSION_KEY)?.value
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export async function destroySession() {
  const jar = await cookies()
  jar.delete(SESSION_KEY)
}
