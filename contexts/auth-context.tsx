"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/types"

interface AuthCtx {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
}

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: false,
  login: async () => "Not initialized",
  logout: async () => {},
})

export function AuthProvider({ children, initialUser }: { children: ReactNode; initialUser: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        return data.error ?? "Login failed"
      }
      const { user: u } = await res.json()
      setUser(u)
      router.push(u.role === "manager" ? "/manager" : "/biller")
      router.refresh()
      return null
    } catch {
      return "Network error"
    } finally {
      setLoading(false)
    }
  }, [router])

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    router.push("/login")
    router.refresh()
  }, [router])

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
