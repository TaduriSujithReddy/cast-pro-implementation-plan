import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Only managers can call these endpoints

async function verifyManager() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "manager") return null
  return user
}

// GET -- list all billers
export async function GET() {
  const manager = await verifyManager()
  if (!manager) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "biller")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST -- create a new biller
export async function POST(req: NextRequest) {
  const manager = await verifyManager()
  if (!manager) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { name, email, password } = await req.json()

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
  }

  const admin = createAdminClient()

  // Create auth user with biller role
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role: "biller" },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  return NextResponse.json({
    biller: { id: authData.user.id, name, email, role: "biller" },
  })
}
