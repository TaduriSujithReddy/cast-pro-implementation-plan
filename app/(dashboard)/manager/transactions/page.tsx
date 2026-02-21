"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Download, Eye, Banknote, QrCode, Receipt, IndianRupee } from "lucide-react"

export default function ManagerTransactionsPage() {
  const { data: bills } = useSWR("/api/bills", fetcher)
  const [search, setSearch] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null)

  const allBills = bills ?? []

  const filtered = useMemo(() => {
    return allBills.filter((b: { bill_number: string; customer_name: string; payment_method: string; profiles?: { name: string } }) => {
      const matchSearch = b.bill_number.toLowerCase().includes(search.toLowerCase()) || (b.customer_name || "").toLowerCase().includes(search.toLowerCase())
      const matchPayment = paymentFilter === "all" || b.payment_method === paymentFilter
      return matchSearch && matchPayment
    })
  }, [allBills, search, paymentFilter])

  const totalRevenue = filtered.reduce((s: number, b: { total: number }) => s + Number(b.total), 0)
  const totalTax = filtered.reduce((s: number, b: { tax_amount: number }) => s + Number(b.tax_amount), 0)

  function exportCSV() {
    const header = "Bill No,Biller,Customer,Date,Payment,Total\n"
    const rows = filtered.map((b: { bill_number: string; profiles?: { name: string }; customer_name: string; created_at: string; payment_method: string; total: number }) =>
      `${b.bill_number},${b.profiles?.name || "N/A"},${b.customer_name || "Walk-in"},${new Date(b.created_at).toLocaleDateString()},${b.payment_method},${b.total}`
    ).join("\n")
    const blob = new Blob([header + rows], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "all-transactions.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  if (!bills) return <div className="flex flex-col gap-6"><h1 className="text-2xl font-bold">All Transactions</h1><Skeleton className="h-96 rounded-xl" /></div>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">All Transactions</h1><p className="text-muted-foreground">Complete view of all billing transactions</p></div>
        <Button variant="outline" size="sm" onClick={exportCSV}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Receipt className="h-5 w-5 text-primary" /><span className="text-sm text-muted-foreground">Total Bills</span></div><div className="mt-1 text-2xl font-bold">{filtered.length}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><IndianRupee className="h-5 w-5 text-emerald-600" /><span className="text-sm text-muted-foreground">Revenue</span></div><div className="mt-1 text-2xl font-bold">Rs.{totalRevenue.toFixed(2)}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Banknote className="h-5 w-5 text-amber-600" /><span className="text-sm text-muted-foreground">Tax Collected</span></div><div className="mt-1 text-2xl font-bold">Rs.{totalTax.toFixed(2)}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><IndianRupee className="h-5 w-5 text-muted-foreground" /><span className="text-sm text-muted-foreground">Avg Bill</span></div><div className="mt-1 text-2xl font-bold">Rs.{filtered.length > 0 ? (totalRevenue / filtered.length).toFixed(2) : "0.00"}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Transaction History</CardTitle></CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search bill number or customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Payments</SelectItem><SelectItem value="cash">Cash</SelectItem><SelectItem value="upi">UPI</SelectItem></SelectContent></Select>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Bill No</TableHead><TableHead>Biller</TableHead><TableHead>Customer</TableHead><TableHead>Date</TableHead><TableHead>Payment</TableHead><TableHead className="text-right">Amount</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No transactions found</TableCell></TableRow>
                ) : filtered.map((bill: Record<string, unknown>) => (
                  <TableRow key={bill.id as number}>
                    <TableCell className="font-medium">{bill.bill_number as string}</TableCell>
                    <TableCell>{(bill.profiles as { name: string } | undefined)?.name ?? "N/A"}</TableCell>
                    <TableCell>{(bill.customer_name as string) || "Walk-in"}</TableCell>
                    <TableCell>{new Date(bill.created_at as string).toLocaleDateString()}</TableCell>
                    <TableCell><Badge variant="secondary" className="flex w-fit items-center gap-1">{(bill.payment_method as string) === "cash" ? <Banknote className="h-3 w-3" /> : <QrCode className="h-3 w-3" />}{(bill.payment_method as string).toUpperCase()}</Badge></TableCell>
                    <TableCell className="text-right font-semibold">Rs.{Number(bill.total).toFixed(2)}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(bill)}><Eye className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
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
                <div><span className="text-muted-foreground">Bill No:</span><p className="font-medium">{selected.bill_number as string}</p></div>
                <div><span className="text-muted-foreground">Biller:</span><p className="font-medium">{(selected.profiles as { name: string } | undefined)?.name ?? "N/A"}</p></div>
                <div><span className="text-muted-foreground">Customer:</span><p className="font-medium">{(selected.customer_name as string) || "Walk-in"}</p></div>
                <div><span className="text-muted-foreground">Date:</span><p className="font-medium">{new Date(selected.created_at as string).toLocaleString()}</p></div>
              </div>
              <Separator />
              <Table>
                <TableHeader><TableRow><TableHead className="text-xs">Item</TableHead><TableHead className="text-center text-xs">Qty</TableHead><TableHead className="text-right text-xs">Total</TableHead></TableRow></TableHeader>
                <TableBody>
                  {((selected.bill_items as Record<string, unknown>[]) ?? []).map((item: Record<string, unknown>, idx: number) => (
                    <TableRow key={idx}><TableCell className="text-xs">{item.product_name as string}</TableCell><TableCell className="text-center text-xs">{item.quantity as number}</TableCell><TableCell className="text-right text-xs">Rs.{Number(item.total).toFixed(2)}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
              <Separator />
              <div className="flex justify-between font-bold text-base"><span>Total</span><span>Rs.{Number(selected.total).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Payment</span><span className="uppercase font-medium">{selected.payment_method as string}</span></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
