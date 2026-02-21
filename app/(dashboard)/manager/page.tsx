"use client"

import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import { Package, AlertTriangle, Truck, IndianRupee, ShoppingCart } from "lucide-react"
import { MetricCard } from "@/components/dashboard/metric-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export default function ManagerDashboard() {
  const { data: stats } = useSWR("/api/dashboard", fetcher)
  const { data: alerts } = useSWR("/api/alerts", fetcher)
  const { data: bills } = useSWR("/api/bills", fetcher)

  const unackedAlerts = alerts?.filter((a: { is_acknowledged: boolean }) => !a.is_acknowledged) ?? []
  const recentBills = bills?.slice(0, 4) ?? []

  if (!stats) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">Manager Dashboard</h1>
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-balance">Manager Dashboard</h1>
        <p className="text-muted-foreground">Overview of your supply chain operations</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Products" value={stats.totalProducts} icon={Package} description={`${stats.lowStockCount} items low stock`} />
        <MetricCard title="Active Vendors" value={stats.totalVendors} icon={Truck} />
        <MetricCard title="Total Revenue" value={`Rs.${stats.totalRevenue.toLocaleString()}`} icon={IndianRupee} />
        <MetricCard title="Today's Bills" value={stats.todayBillCount} icon={ShoppingCart} description={`Rs.${stats.todayRevenue.toLocaleString()} today`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Alerts Widget */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Stock Alerts</CardTitle>
              <CardDescription>{unackedAlerts.length} unacknowledged</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/manager/stock-alerts">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {unackedAlerts.slice(0, 4).map((alert: { id: number; severity: string; products: { name: string } | null; message: string }) => (
              <div key={alert.id} className="flex items-start gap-3">
                <Badge variant={alert.severity === "critical" ? "destructive" : alert.severity === "warning" ? "default" : "secondary"} className="mt-0.5 shrink-0 text-[10px]">
                  {alert.severity}
                </Badge>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight">{alert.products?.name ?? "Unknown"}</p>
                  <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                </div>
              </div>
            ))}
            {unackedAlerts.length === 0 && <p className="text-sm text-muted-foreground">No pending alerts</p>}
          </CardContent>
        </Card>

        {/* Quick Actions */}
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

        {/* Recent Bills */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentBills.map((bill: { id: number; bill_number: string; customer_name: string; total: number; profiles?: { name: string } }) => (
              <div key={bill.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{bill.bill_number}</p>
                  <p className="text-xs text-muted-foreground">{bill.customer_name || "Walk-in"} - {bill.profiles?.name ?? "Unknown"}</p>
                </div>
                <span className="font-semibold">Rs.{Number(bill.total).toLocaleString()}</span>
              </div>
            ))}
            {recentBills.length === 0 && <p className="text-sm text-muted-foreground">No bills yet</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
