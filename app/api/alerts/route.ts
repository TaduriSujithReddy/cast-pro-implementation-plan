import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("stock_alerts")
    .select("*, products(name, stock, min_stock)")
    .order("created_at", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(req: Request) {
  const supabase = await createClient()
  const { id, acknowledge_all } = await req.json()
  const { data: { user } } = await supabase.auth.getUser()

  if (acknowledge_all) {
    const { error } = await supabase
      .from("stock_alerts")
      .update({ is_acknowledged: true, acknowledged_by: user?.id })
      .eq("is_acknowledged", false)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else if (id) {
    const { error } = await supabase
      .from("stock_alerts")
      .update({ is_acknowledged: true, acknowledged_by: user?.id })
      .eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
