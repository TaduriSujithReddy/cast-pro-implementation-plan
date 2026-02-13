"use client"

import { Package, AlertTriangle, Truck, TrendingUp, IndianRupee, ShoppingCart } from "lucide-react"
import { MetricCard } from "@/components/dashboard/metric-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { products, vendors, bills, stockAlerts, salesChartData } from "@/lib/mock-data"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const totalStock = products.reduce((s, p) => s + p.currentStock, 0)
const lowStockCount = products.filter((p) => p.currentStock <= p.threshold).length
const activeVendors = vendors.filter((v) => v.isActive).length
const totalRevenue = bills.reduce((s, b) => s + b.totalAmount, 0)
const criticalAlerts = stockAlerts.filter((a) => a.severity === "critical" && !a.acknowledged).length

export default function ManagerDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-balance">Manager Dashboard</h1>
        <p className="text-muted-foreground">Overview of your supply chain operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Stock Units" value={totalStock.toLocaleString()} icon={Package} trend={{ value: 5.2, label: "vs last month" }} />
        <MetricCard title="Active Vendors" value={activeVendors} icon={Truck} description={`${vendors.length} total vendors`} />
        <MetricCard title="Revenue (Feb)" value={`Rs.${totalRevenue.toLocaleString()}`} icon={IndianRupee} trend={{ value: 12.3, label: "vs Jan" }} />
        <MetricCard title="Critical Alerts" value={criticalAlerts} icon={AlertTriangle} description={`${lowStockCount} items below threshold`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales Trend (30 Days)</CardTitle>
            <CardDescription>Daily revenue overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }} />
                  <Area type="monotone" dataKey="sales" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Stock Alerts Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Stock Alerts</CardTitle>
              <CardDescription>{stockAlerts.filter((a) => !a.acknowledged).length} unacknowledged</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/manager/stock-alerts">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {stockAlerts.filter((a) => !a.acknowledged).slice(0, 4).map((alert) => (
              <div key={alert.id} className="flex items-start gap-3">
                <Badge variant={alert.severity === "critical" ? "destructive" : alert.severity === "warning" ? "default" : "secondary"} className="mt-0.5 shrink-0 text-[10px]">
                  {alert.severity}
                </Badge>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight">{alert.productName}</p>
                  <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button asChild><Link href="/inventory">Manage Inventory</Link></Button>
            <Button variant="outline" asChild><Link href="/manager/vendors">Manage Vendors</Link></Button>
            <Button variant="outline" asChild><Link href="/manager/demand-forecast">View Forecast</Link></Button>
            <Button variant="outline" asChild><Link href="/manager/reports">Generate Report</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Bills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {bills.slice(-4).reverse().map((bill) => (
              <div key={bill.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{bill.billNumber}</p>
                  <p className="text-xs text-muted-foreground">{bill.customerName} - {bill.billerName}</p>
                </div>
                <span className="font-semibold">Rs.{bill.totalAmount.toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
