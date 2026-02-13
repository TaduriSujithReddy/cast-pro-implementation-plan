"use client"

import { useState, useMemo } from "react"
import { bills } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Search, Download, Eye, Banknote, QrCode, Receipt, IndianRupee } from "lucide-react"
import type { Bill } from "@/lib/types"

export default function ManagerTransactionsPage() {
  const [search, setSearch] = useState("")
  const [billerFilter, setBillerFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [selected, setSelected] = useState<Bill | null>(null)

  const billerNames = [...new Set(bills.map((b) => b.billerName))]

  const filtered = useMemo(() => {
    return bills
      .filter((b) => {
        const matchSearch =
          b.billNumber.toLowerCase().includes(search.toLowerCase()) ||
          b.customerName.toLowerCase().includes(search.toLowerCase())
        const matchBiller = billerFilter === "all" || b.billerName === billerFilter
        const matchPayment = paymentFilter === "all" || b.paymentMethod === paymentFilter
        return matchSearch && matchBiller && matchPayment
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [search, billerFilter, paymentFilter])

  const totalRevenue = filtered.reduce((s, b) => s + b.totalAmount, 0)
  const totalTax = filtered.reduce((s, b) => s + b.taxAmount, 0)

  function exportCSV() {
    const header = "Bill No,Biller,Customer,Date,Payment,Subtotal,Tax,Discount,Total\n"
    const rows = filtered
      .map((b) => `${b.billNumber},${b.billerName},${b.customerName},${new Date(b.createdAt).toLocaleDateString()},${b.paymentMethod},${b.subtotal},${b.taxAmount},${b.discount},${b.totalAmount}`)
      .join("\n")
    const blob = new Blob([header + rows], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "all-transactions.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Transactions</h1>
          <p className="text-muted-foreground">Complete view of all billing transactions</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="mr-2 h-4 w-4" />Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2"><Receipt className="h-5 w-5 text-primary" /><span className="text-sm text-muted-foreground">Total Bills</span></div>
            <div className="mt-1 text-2xl font-bold">{filtered.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2"><IndianRupee className="h-5 w-5 text-emerald-600" /><span className="text-sm text-muted-foreground">Revenue</span></div>
            <div className="mt-1 text-2xl font-bold">Rs.{totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2"><Banknote className="h-5 w-5 text-amber-600" /><span className="text-sm text-muted-foreground">Tax Collected</span></div>
            <div className="mt-1 text-2xl font-bold">Rs.{totalTax.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2"><IndianRupee className="h-5 w-5 text-muted-foreground" /><span className="text-sm text-muted-foreground">Avg Bill Value</span></div>
            <div className="mt-1 text-2xl font-bold">Rs.{filtered.length > 0 ? (totalRevenue / filtered.length).toFixed(2) : "0.00"}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Transaction History</CardTitle></CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search bill number or customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={billerFilter} onValueChange={setBillerFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Biller" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Billers</SelectItem>
                {billerNames.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill No</TableHead>
                  <TableHead>Biller</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No transactions found</TableCell></TableRow>
                ) : (
                  filtered.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{bill.billNumber}</TableCell>
                      <TableCell>{bill.billerName}</TableCell>
                      <TableCell>{bill.customerName}</TableCell>
                      <TableCell>{new Date(bill.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="flex w-fit items-center gap-1">
                          {bill.paymentMethod === "cash" ? <Banknote className="h-3 w-3" /> : <QrCode className="h-3 w-3" />}
                          {bill.paymentMethod.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">Rs.{bill.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(bill)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Bill Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="flex flex-col gap-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Bill No:</span><p className="font-medium">{selected.billNumber}</p></div>
                <div><span className="text-muted-foreground">Biller:</span><p className="font-medium">{selected.billerName}</p></div>
                <div><span className="text-muted-foreground">Customer:</span><p className="font-medium">{selected.customerName}</p></div>
                <div><span className="text-muted-foreground">Date:</span><p className="font-medium">{new Date(selected.createdAt).toLocaleString()}</p></div>
              </div>
              <Separator />
              <Table>
                <TableHeader><TableRow><TableHead className="text-xs">Item</TableHead><TableHead className="text-center text-xs">Qty</TableHead><TableHead className="text-right text-xs">Total</TableHead></TableRow></TableHeader>
                <TableBody>
                  {selected.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-xs">{item.productName}</TableCell>
                      <TableCell className="text-center text-xs">{item.quantity}</TableCell>
                      <TableCell className="text-right text-xs">Rs.{item.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Separator />
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>Rs.{selected.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax ({selected.taxRate}%)</span><span>Rs.{selected.taxAmount.toFixed(2)}</span></div>
              {selected.discount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>-Rs.{selected.discount.toFixed(2)}</span></div>}
              <div className="flex justify-between font-bold text-base"><span>Total</span><span>Rs.{selected.totalAmount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Payment</span><span className="uppercase font-medium">{selected.paymentMethod}</span></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
