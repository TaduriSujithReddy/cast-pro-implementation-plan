"use client"

import { useMemo } from "react"
import { bills, products, users } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Download, BarChart3, ShoppingCart, Package, Users } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"

const COLORS = ["#1E40AF", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"]

export default function ReportsPage() {
  // Sales report data
  const salesByDate = useMemo(() => {
    const map = new Map<string, number>()
    bills.forEach((b) => {
      const day = b.createdAt.slice(0, 10)
      map.set(day, (map.get(day) || 0) + b.totalAmount)
    })
    return Array.from(map.entries()).map(([date, total]) => ({ date, total })).sort((a, b) => a.date.localeCompare(b.date))
  }, [])

  // Top products
  const topProducts = useMemo(() => {
    const map = new Map<string, { qty: number; revenue: number }>()
    bills.forEach((b) => b.items.forEach((item) => {
      const entry = map.get(item.productName) || { qty: 0, revenue: 0 }
      entry.qty += item.quantity
      entry.revenue += item.total
      map.set(item.productName, entry)
    }))
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
  }, [])

  // Inventory status
  const inventoryStatus = useMemo(() => {
    const critical = products.filter((p) => p.currentStock <= p.threshold * 0.5).length
    const low = products.filter((p) => p.currentStock > p.threshold * 0.5 && p.currentStock <= p.threshold).length
    const healthy = products.filter((p) => p.currentStock > p.threshold).length
    return [
      { name: "Critical", value: critical },
      { name: "Low", value: low },
      { name: "Healthy", value: healthy },
    ]
  }, [])

  // Biller performance
  const billerPerformance = useMemo(() => {
    const billers = users.filter((u) => u.role === "biller")
    return billers.map((biller) => {
      const billerBills = bills.filter((b) => b.billerId === biller.id)
      return {
        name: biller.name,
        totalBills: billerBills.length,
        totalRevenue: billerBills.reduce((s, b) => s + b.totalAmount, 0),
        avgBillValue: billerBills.length > 0 ? billerBills.reduce((s, b) => s + b.totalAmount, 0) / billerBills.length : 0,
      }
    })
  }, [])

  const totalRevenue = bills.reduce((s, b) => s + b.totalAmount, 0)

  function exportReport(tab: string) {
    let csv = ""
    if (tab === "sales") {
      csv = "Date,Total\n" + salesByDate.map((r) => `${r.date},${r.total}`).join("\n")
    } else if (tab === "products") {
      csv = "Product,Quantity Sold,Revenue\n" + topProducts.map((r) => `${r.name},${r.qty},${r.revenue}`).join("\n")
    } else if (tab === "inventory") {
      csv = "Product,SKU,Stock,Threshold,Status\n" + products.map((p) => `${p.name},${p.sku},${p.currentStock},${p.threshold},${p.currentStock <= p.threshold ? "Low" : "OK"}`).join("\n")
    } else {
      csv = "Biller,Bills,Revenue,Avg Value\n" + billerPerformance.map((r) => `${r.name},${r.totalBills},${r.totalRevenue.toFixed(2)},${r.avgBillValue.toFixed(2)}`).join("\n")
    }
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${tab}-report.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Business analytics and exportable reports</p>
      </div>

      <Tabs defaultValue="sales">
        <TabsList className="mb-4">
          <TabsTrigger value="sales" className="flex items-center gap-1"><BarChart3 className="h-4 w-4" />Sales</TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-1"><ShoppingCart className="h-4 w-4" />Top Products</TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-1"><Package className="h-4 w-4" />Inventory</TabsTrigger>
          <TabsTrigger value="billers" className="flex items-center gap-1"><Users className="h-4 w-4" />Biller Perf.</TabsTrigger>
        </TabsList>

        {/* Sales Tab */}
        <TabsContent value="sales">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Sales Report</h2>
            <Button variant="outline" size="sm" onClick={() => exportReport("sales")}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={salesByDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => `Rs.${v.toFixed(2)}`} />
                  <Bar dataKey="total" name="Revenue" fill="#1E40AF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold">Rs.{totalRevenue.toFixed(2)}</p></div>
                <div><p className="text-sm text-muted-foreground">Total Bills</p><p className="text-2xl font-bold">{bills.length}</p></div>
                <div><p className="text-sm text-muted-foreground">Avg Bill Value</p><p className="text-2xl font-bold">Rs.{(totalRevenue / bills.length).toFixed(2)}</p></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Products Tab */}
        <TabsContent value="products">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Top Products by Revenue</h2>
            <Button variant="outline" size="sm" onClick={() => exportReport("products")}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Qty Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((p, i) => (
                    <TableRow key={p.name}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-right">{p.qty}</TableCell>
                      <TableCell className="text-right font-semibold">Rs.{p.revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Inventory Status</h2>
            <Button variant="outline" size="sm" onClick={() => exportReport("inventory")}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Stock Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={inventoryStatus} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {inventoryStatus.map((_, i) => <Cell key={i} fill={["#EF4444", "#F59E0B", "#10B981"][i]} />)}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Product Stock Levels</CardTitle></CardHeader>
              <CardContent className="max-h-[300px] overflow-y-auto">
                <div className="flex flex-col gap-3">
                  {products.map((p) => {
                    const pct = Math.min((p.currentStock / (p.threshold * 2)) * 100, 100)
                    return (
                      <div key={p.id}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{p.name}</span>
                          <span className="text-muted-foreground">{p.currentStock}/{p.threshold * 2}</span>
                        </div>
                        <Progress value={pct} className="mt-1 h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Biller Performance Tab */}
        <TabsContent value="billers">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Biller Performance</h2>
            <Button variant="outline" size="sm" onClick={() => exportReport("billers")}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Biller</TableHead>
                    <TableHead className="text-right">Bills</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Avg Bill Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billerPerformance.map((bp) => (
                    <TableRow key={bp.name}>
                      <TableCell className="font-medium">{bp.name}</TableCell>
                      <TableCell className="text-right">{bp.totalBills}</TableCell>
                      <TableCell className="text-right font-semibold">Rs.{bp.totalRevenue.toFixed(2)}</TableCell>
                      <TableCell className="text-right">Rs.{bp.avgBillValue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
