"use client"

import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import { useAuth } from "@/contexts/auth-context"
import { IndianRupee, ShoppingCart, Receipt, AlertTriangle } from "lucide-react"
import { MetricCard } from "@/components/dashboard/metric-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)"]

export default function BillerDashboard() {
  const { user } = useAuth()
  const { data: bills } = useSWR(user ? `/api/bills?biller_id=${user.id}` : null, fetcher)
  const { data: products } = useSWR("/api/products", fetcher)

  const myBills = bills ?? []
  const todayTotal = myBills.reduce((s: number, b: { total: number }) => s + Number(b.total), 0)
  const cashBills = myBills.filter((b: { payment_method: string }) => b.payment_method === "cash").length
  const upiBills = myBills.filter((b: { payment_method: string }) => b.payment_method === "upi").length
  const lowStockItems = (products ?? []).filter((p: { stock: number; min_stock: number }) => p.stock <= p.min_stock)

  const paymentData = [
    { name: "Cash", value: cashBills },
    { name: "UPI", value: upiBills },
  ]

  if (!bills) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">Biller Dashboard</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">Biller Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </div>
        <Button asChild>
          <Link href="/biller/billing"><ShoppingCart className="mr-2 h-4 w-4" />Create New Bill</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Sales" value={`Rs.${todayTotal.toLocaleString()}`} icon={IndianRupee} />
        <MetricCard title="Bills Created" value={myBills.length} icon={Receipt} />
        <MetricCard title="Avg Bill Value" value={`Rs.${myBills.length ? Math.round(todayTotal / myBills.length).toLocaleString() : 0}`} icon={ShoppingCart} />
        <MetricCard title="Low Stock Items" value={lowStockItems.length} icon={AlertTriangle} description="Items below threshold" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Bills</CardTitle>
              <CardDescription>Your latest transactions</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/biller/transactions">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {myBills.slice(0, 5).map((bill: { id: number; bill_number: string; customer_name: string; created_at: string; payment_method: string; total: number }) => (
              <div key={bill.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">{bill.bill_number}</p>
                  <p className="text-xs text-muted-foreground">{bill.customer_name || "Walk-in"} -- {new Date(bill.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={bill.payment_method === "cash" ? "default" : "secondary"}>{bill.payment_method.toUpperCase()}</Badge>
                  <span className="text-sm font-semibold">Rs.{Number(bill.total).toLocaleString()}</span>
                </div>
              </div>
            ))}
            {myBills.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No bills yet. Create your first bill!</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Distribution by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                    {paymentData.map((_, idx) => <Cell key={idx} fill={COLORS[idx]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" />Low Stock Items</CardTitle>
            <CardDescription>These items are below their reorder threshold</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {lowStockItems.map((p: { id: number; name: string; stock: number; min_stock: number }) => (
                <div key={p.id} className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm font-medium">{p.name}</span>
                  <Badge variant={p.stock <= p.min_stock / 2 ? "destructive" : "default"}>{p.stock} left</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
