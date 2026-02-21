import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const role = req.nextUrl.searchParams.get("role")
  let query = supabase.from("profiles").select("*").order("name")
  if (role) query = query.eq("role", role)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
