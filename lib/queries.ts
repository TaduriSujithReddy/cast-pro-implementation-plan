import { createClient } from "@/lib/supabase/server"

/* ── Products ── */
export async function getProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select("*, vendors(name)")
    .eq("is_active", true)
    .order("name")
  if (error) throw error
  return data ?? []
}

export async function getProductById(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("products").select("*, vendors(name)").eq("id", id).single()
  if (error) throw error
  return data
}

export async function createProduct(product: {
  name: string; sku: string; category: string; price: number;
  cost_price?: number; stock: number; min_stock?: number; unit?: string; vendor_id?: number;
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("products").insert(product).select().single()
  if (error) throw error
  return data
}

export async function updateProduct(id: number, updates: Record<string, unknown>) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("products").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single()
  if (error) throw error
  return data
}

export async function deleteProduct(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from("products").update({ is_active: false }).eq("id", id)
  if (error) throw error
}

/* ── Vendors ── */
export async function getVendors() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("vendors").select("*").eq("is_active", true).order("name")
  if (error) throw error
  return data ?? []
}

export async function createVendor(vendor: { name: string; contact?: string; email?: string; address?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase.from("vendors").insert({ ...vendor, created_by: user?.id }).select().single()
  if (error) throw error
  return data
}

export async function updateVendor(id: number, updates: Record<string, unknown>) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("vendors").update(updates).eq("id", id).select().single()
  if (error) throw error
  return data
}

export async function deleteVendor(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from("vendors").update({ is_active: false }).eq("id", id)
  if (error) throw error
}

/* ── Bills ── */
export async function getBills(limit?: number) {
  const supabase = await createClient()
  let query = supabase.from("bills").select("*, bill_items(*, products(name))").order("created_at", { ascending: false })
  if (limit) query = query.limit(limit)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getBillsByBiller(billerId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("bills")
    .select("*, bill_items(*, products(name))")
    .eq("biller_id", billerId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getBillById(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("bills")
    .select("*, bill_items(*, products(name))")
    .eq("id", id)
    .single()
  if (error) throw error
  return data
}

export async function createBill(bill: {
  bill_number: string; customer_name?: string; customer_phone?: string;
  subtotal: number; tax_percent: number; tax_amount: number;
  discount_percent: number; discount_amount: number; total: number;
  payment_method: string; payment_status?: string;
  cash_received?: number; change_amount?: number; biller_id: string;
}, items: { product_id: number; product_name: string; quantity: number; unit_price: number; total: number }[]) {
  const supabase = await createClient()

  // Insert the bill
  const { data: newBill, error: billError } = await supabase.from("bills").insert(bill).select().single()
  if (billError) throw billError

  // Insert bill items
  const itemsWithBillId = items.map((item) => ({ ...item, bill_id: newBill.id }))
  const { error: itemsError } = await supabase.from("bill_items").insert(itemsWithBillId)
  if (itemsError) throw itemsError

  // Deduct stock for each item
  for (const item of items) {
    const { data: product } = await supabase.from("products").select("stock").eq("id", item.product_id).single()
    if (product) {
      const newStock = Math.max(0, product.stock - item.quantity)
      await supabase.from("products").update({ stock: newStock, updated_at: new Date().toISOString() }).eq("id", item.product_id)

      // Auto-create stock alert if stock is low
      const { data: prod } = await supabase.from("products").select("min_stock, name").eq("id", item.product_id).single()
      if (prod && newStock <= prod.min_stock) {
        const severity = newStock === 0 ? "critical" : newStock <= prod.min_stock / 2 ? "critical" : "warning"
        const alertType = newStock === 0 ? "out_of_stock" : "low_stock"
        await supabase.from("stock_alerts").insert({
          product_id: item.product_id,
          alert_type: alertType,
          severity,
          message: `${prod.name} stock is ${newStock === 0 ? "out" : "low"} (${newStock} units, min: ${prod.min_stock})`,
        })
      }
    }
  }

  return newBill
}

/* ── Stock Alerts ── */
export async function getStockAlerts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("stock_alerts")
    .select("*, products(name, stock, min_stock)")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function acknowledgeAlert(id: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase.from("stock_alerts").update({ is_acknowledged: true, acknowledged_by: user?.id }).eq("id", id)
  if (error) throw error
}

/* ── Store Settings ── */
export async function getStoreSettings() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("store_settings").select("*").limit(1).single()
  if (error) throw error
  return data
}

export async function updateStoreSettings(updates: Record<string, unknown>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from("store_settings")
    .update({ ...updates, updated_by: user?.id, updated_at: new Date().toISOString() })
    .eq("id", 1)
    .select()
    .single()
  if (error) throw error
  return data
}

/* ── Profiles (billers list for manager) ── */
export async function getProfiles(role?: string) {
  const supabase = await createClient()
  let query = supabase.from("profiles").select("*").order("name")
  if (role) query = query.eq("role", role)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

/* ── Dashboard Stats ── */
export async function getDashboardStats() {
  const supabase = await createClient()

  const { count: totalProducts } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true)
  const { count: totalVendors } = await supabase.from("vendors").select("*", { count: "exact", head: true }).eq("is_active", true)
  const { count: totalBills } = await supabase.from("bills").select("*", { count: "exact", head: true })
  const { data: lowStockProducts } = await supabase.from("products").select("id, stock, min_stock").eq("is_active", true)
  const lowStockCount = lowStockProducts?.filter((p) => p.stock <= p.min_stock).length ?? 0

  // Total revenue
  const { data: bills } = await supabase.from("bills").select("total")
  const totalRevenue = bills?.reduce((sum, b) => sum + Number(b.total), 0) ?? 0

  // Today's bills
  const today = new Date().toISOString().split("T")[0]
  const { data: todayBills } = await supabase
    .from("bills")
    .select("total, payment_method")
    .gte("created_at", `${today}T00:00:00`)
    .lte("created_at", `${today}T23:59:59`)

  const todayRevenue = todayBills?.reduce((sum, b) => sum + Number(b.total), 0) ?? 0
  const todayBillCount = todayBills?.length ?? 0

  return {
    totalProducts: totalProducts ?? 0,
    totalVendors: totalVendors ?? 0,
    totalBills: totalBills ?? 0,
    lowStockCount,
    totalRevenue,
    todayRevenue,
    todayBillCount,
  }
}

/* ── Generate Bill Number ── */
export async function generateBillNumber() {
  const supabase = await createClient()
  const { count } = await supabase.from("bills").select("*", { count: "exact", head: true })
  const num = (count ?? 0) + 1
  return `BILL-${String(num).padStart(5, "0")}`
}
