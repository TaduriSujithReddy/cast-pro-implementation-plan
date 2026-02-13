"use client"

import { IndianRupee, ShoppingCart, Receipt, AlertTriangle } from "lucide-react"
import { MetricCard } from "@/components/dashboard/metric-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { bills, products } from "@/lib/mock-data"
import { useAuth } from "@/contexts/auth-context"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)"]

export default function BillerDashboard() {
  const { user } = useAuth()
  const myBills = bills.filter((b) => b.billerId === user?.id)
  const todayTotal = myBills.reduce((s, b) => s + b.totalAmount, 0)
  const cashBills = myBills.filter((b) => b.paymentMethod === "cash").length
  const upiBills = myBills.filter((b) => b.paymentMethod === "upi").length
  const lowStockItems = products.filter((p) => p.currentStock <= p.threshold)

  const paymentData = [
    { name: "Cash", value: cashBills },
    { name: "UPI", value: upiBills },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">Biller Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </div>
        <Button asChild>
          <Link href="/biller/billing">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Create New Bill
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Sales" value={`Rs.${todayTotal.toLocaleString()}`} icon={IndianRupee} trend={{ value: 8.1, label: "vs last week" }} />
        <MetricCard title="Bills Created" value={myBills.length} icon={Receipt} description="This period" />
        <MetricCard title="Avg Bill Value" value={`Rs.${myBills.length ? Math.round(todayTotal / myBills.length).toLocaleString() : 0}`} icon={ShoppingCart} />
        <MetricCard title="Low Stock Items" value={lowStockItems.length} icon={AlertTriangle} description="Items below threshold" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent Transactions */}
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
            {myBills.slice(-5).reverse().map((bill) => (
              <div key={bill.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">{bill.billNumber}</p>
                  <p className="text-xs text-muted-foreground">{bill.customerName} -- {new Date(bill.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={bill.paymentMethod === "cash" ? "default" : "secondary"}>{bill.paymentMethod.toUpperCase()}</Badge>
                  <span className="text-sm font-semibold">Rs.{bill.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payment Chart */}
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
                    {paymentData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Awareness */}
      {lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Low Stock Items
            </CardTitle>
            <CardDescription>These items are below their reorder threshold</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {lowStockItems.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm font-medium">{p.name}</span>
                  <Badge variant={p.currentStock <= p.threshold / 2 ? "destructive" : "default"}>
                    {p.currentStock} left
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
