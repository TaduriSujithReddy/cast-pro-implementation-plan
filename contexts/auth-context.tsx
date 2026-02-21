"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { AppUser } from "@/lib/auth"

interface AuthCtx {
  user: AppUser | null
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

export function AuthProvider({ children, initialUser }: { children: ReactNode; initialUser: AppUser | null }) {
  const [user, setUser] = useState<AppUser | null>(initialUser)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return error.message

      // Fetch profile to get role
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return "Failed to get user"

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single()

      if (!profile) return "Profile not found"

      const appUser: AppUser = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
      }

      setUser(appUser)
      router.push(appUser.role === "manager" ? "/manager" : "/biller")
      router.refresh()
      return null
    } catch {
      return "Network error"
    } finally {
      setLoading(false)
    }
  }, [router])

  const logout = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    router.push("/login")
    router.refresh()
  }, [router])

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
