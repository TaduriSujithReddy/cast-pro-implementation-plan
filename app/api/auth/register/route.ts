import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json()

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
  }

  const admin = createAdminClient()

  // Check if a manager already exists -- only one manager per org
  const { data: existingManagers } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "manager")

  if (existingManagers && existingManagers.length > 0) {
    return NextResponse.json(
      { error: "A manager account already exists. Only one manager per organization is allowed." },
      { status: 409 }
    )
  }

  // Create auth user with manager role in metadata
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // auto-confirm so they can login immediately
    user_metadata: { name, role: "manager" },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  return NextResponse.json({ user: { id: authData.user.id, email, name, role: "manager" } })
}
