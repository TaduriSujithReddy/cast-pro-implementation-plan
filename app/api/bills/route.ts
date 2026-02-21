import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const billerId = req.nextUrl.searchParams.get("biller_id")

  let query = supabase
    .from("bills")
    .select("*, bill_items(*, products(name)), profiles!bills_biller_id_fkey(name)")
    .order("created_at", { ascending: false })

  if (billerId) {
    query = query.eq("biller_id", billerId)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { bill, items } = await req.json()

  // Insert the bill
  const { data: newBill, error: billError } = await supabase.from("bills").insert(bill).select().single()
  if (billError) return NextResponse.json({ error: billError.message }, { status: 500 })

  // Insert bill items
  const itemsWithBillId = items.map((item: Record<string, unknown>) => ({ ...item, bill_id: newBill.id }))
  const { error: itemsError } = await supabase.from("bill_items").insert(itemsWithBillId)
  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })

  // Deduct stock for each item
  for (const item of items) {
    const { data: product } = await supabase.from("products").select("stock, min_stock, name").eq("id", item.product_id).single()
    if (product) {
      const newStock = Math.max(0, product.stock - item.quantity)
      await supabase.from("products").update({ stock: newStock, updated_at: new Date().toISOString() }).eq("id", item.product_id)

      if (newStock <= product.min_stock) {
        const severity = newStock === 0 ? "critical" : newStock <= product.min_stock / 2 ? "critical" : "warning"
        const alertType = newStock === 0 ? "out_of_stock" : "low_stock"
        await supabase.from("stock_alerts").insert({
          product_id: item.product_id,
          alert_type: alertType,
          severity,
          message: `${product.name} stock is ${newStock === 0 ? "out" : "low"} (${newStock} units, min: ${product.min_stock})`,
        })
      }
    }
  }

  return NextResponse.json(newBill)
}
