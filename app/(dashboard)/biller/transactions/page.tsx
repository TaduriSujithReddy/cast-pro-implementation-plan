"use client"

import { useState, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { bills } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Search, Download, Eye, FileText, Banknote, QrCode } from "lucide-react"
import type { Bill } from "@/lib/types"

export default function BillerTransactionsPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [selected, setSelected] = useState<Bill | null>(null)

  const myBills = useMemo(() => {
    return bills
      .filter((b) => b.billerId === user?.id)
      .filter((b) => {
        const matchesSearch =
          b.billNumber.toLowerCase().includes(search.toLowerCase()) ||
          b.customerName.toLowerCase().includes(search.toLowerCase())
        const matchesPayment = paymentFilter === "all" || b.paymentMethod === paymentFilter
        return matchesSearch && matchesPayment
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [search, paymentFilter, user?.id])

  const totalRevenue = myBills.reduce((s, b) => s + b.totalAmount, 0)

  function exportCSV() {
    const header = "Bill No,Customer,Date,Payment,Total\n"
    const rows = myBills
      .map((b) => `${b.billNumber},${b.customerName},${new Date(b.createdAt).toLocaleDateString()},${b.paymentMethod},${b.totalAmount}`)
      .join("\n")
    const blob = new Blob([header + rows], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "my-transactions.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Transactions</h1>
          <p className="text-muted-foreground">View all bills you have created</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="mr-2 h-4 w-4" />Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{myBills.length}</div>
            <p className="text-xs text-muted-foreground">Total Bills</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">Rs.{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">Rs.{myBills.length > 0 ? (totalRevenue / myBills.length).toFixed(2) : "0.00"}</div>
            <p className="text-xs text-muted-foreground">Average Bill Value</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search bill number or customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
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
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myBills.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No transactions found</TableCell></TableRow>
                ) : (
                  myBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{bill.billNumber}</TableCell>
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

      {/* Bill Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bill Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="flex flex-col gap-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Bill No:</span><p className="font-medium">{selected.billNumber}</p></div>
                <div><span className="text-muted-foreground">Date:</span><p className="font-medium">{new Date(selected.createdAt).toLocaleString()}</p></div>
                <div><span className="text-muted-foreground">Customer:</span><p className="font-medium">{selected.customerName}</p></div>
                <div><span className="text-muted-foreground">Phone:</span><p className="font-medium">{selected.customerPhone}</p></div>
              </div>
              <Separator />
              <Table>
                <TableHeader><TableRow><TableHead className="text-xs">Item</TableHead><TableHead className="text-center text-xs">Qty</TableHead><TableHead className="text-right text-xs">Total</TableHead></TableRow></TableHeader>
                <TableBody>
                  {selected.items.map((item) => (
                    <TableRow key={item.productId}>
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
              {selected.paymentMethod === "cash" && (
                <>
                  <div className="flex justify-between"><span className="text-muted-foreground">Cash Received</span><span>Rs.{selected.cashReceived?.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Change</span><span>Rs.{selected.changeReturned?.toFixed(2)}</span></div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
