import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

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

// DELETE -- remove a biller account entirely
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const manager = await verifyManager()
  if (!manager) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { id } = await params

  // Prevent deleting self
  if (id === manager.id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
  }

  const admin = createAdminClient()

  // Verify target is actually a biller
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", id)
    .single()

  if (!profile || profile.role !== "biller") {
    return NextResponse.json({ error: "User is not a biller or does not exist" }, { status: 404 })
  }

  // Delete auth user -- cascade will remove profile too
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
