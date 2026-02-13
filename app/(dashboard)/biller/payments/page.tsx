"use client"

import { useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { bills } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Banknote, QrCode, TrendingUp } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"

const PIE_COLORS = ["#1E40AF", "#10B981"]

export default function BillerPaymentsPage() {
  const { user } = useAuth()

  const myBills = useMemo(() => bills.filter((b) => b.billerId === user?.id), [user?.id])

  const cashBills = myBills.filter((b) => b.paymentMethod === "cash")
  const upiBills = myBills.filter((b) => b.paymentMethod === "upi")
  const cashTotal = cashBills.reduce((s, b) => s + b.totalAmount, 0)
  const upiTotal = upiBills.reduce((s, b) => s + b.totalAmount, 0)

  const pieData = [
    { name: "Cash", value: cashTotal },
    { name: "UPI", value: upiTotal },
  ]

  const dailyData = useMemo(() => {
    const map = new Map<string, { cash: number; upi: number }>()
    myBills.forEach((b) => {
      const day = b.createdAt.slice(0, 10)
      const entry = map.get(day) || { cash: 0, upi: 0 }
      entry[b.paymentMethod] += b.totalAmount
      map.set(day, entry)
    })
    return Array.from(map.entries())
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [myBills])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment Summary</h1>
        <p className="text-muted-foreground">Overview of payments collected across your bills</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">Cash Collected</p>
            </div>
            <div className="mt-1 text-2xl font-bold">Rs.{cashTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{cashBills.length} transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-emerald-600" />
              <p className="text-sm text-muted-foreground">UPI Received</p>
            </div>
            <div className="mt-1 text-2xl font-bold">Rs.{upiTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{upiBills.length} transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-600" />
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
            <div className="mt-1 text-2xl font-bold">Rs.{(cashTotal + upiTotal).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{myBills.length} total bills</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Payment Method Split</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(v: number) => `Rs.${v.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Daily Payment Breakdown</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `Rs.${v.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="cash" name="Cash" fill="#1E40AF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="upi" name="UPI" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Payments</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill No</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myBills.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.billNumber}</TableCell>
                  <TableCell>{b.customerName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="flex w-fit items-center gap-1">
                      {b.paymentMethod === "cash" ? <Banknote className="h-3 w-3" /> : <QrCode className="h-3 w-3" />}
                      {b.paymentMethod.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">Rs.{b.totalAmount.toFixed(2)}</TableCell>
                  <TableCell><Badge className="bg-emerald-100 text-emerald-700">Completed</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
