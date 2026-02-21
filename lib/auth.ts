import { createClient } from "@/lib/supabase/server"

export type UserRole = "manager" | "biller"

export interface AppUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export async function getSession(): Promise<AppUser | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile) return null

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role as UserRole,
  }
}
