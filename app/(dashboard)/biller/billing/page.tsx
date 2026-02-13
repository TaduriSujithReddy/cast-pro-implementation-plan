"use client"

import { useState, useMemo, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { products as allProducts, storeSettings } from "@/lib/mock-data"
import type { BillItem } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Search, Plus, Minus, Trash2, ShoppingCart, Printer, QrCode, Banknote } from "lucide-react"

export default function BillingPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const [cart, setCart] = useState<BillItem[]>([])
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [discount, setDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi">("cash")
  const [cashReceived, setCashReceived] = useState(0)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [savedBill, setSavedBill] = useState<{ billNumber: string; date: string } | null>(null)
  const receiptRef = useRef<HTMLDivElement>(null)

  const taxRate = storeSettings.taxRate
  const subtotal = cart.reduce((s, i) => s + i.total, 0)
  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100
  const totalAmount = subtotal + taxAmount - discount
  const changeReturned = paymentMethod === "cash" ? Math.max(0, cashReceived - totalAmount) : 0

  const searchResults = useMemo(() => {
    if (!search.trim()) return []
    return allProducts.filter((p) => p.isActive && p.currentStock > 0 && (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))).slice(0, 8)
  }, [search])

  function addToCart(productId: number) {
    const product = allProducts.find((p) => p.id === productId)
    if (!product) return
    const existing = cart.find((i) => i.productId === productId)
    if (existing) {
      setCart((prev) => prev.map((i) => i.productId === productId ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice } : i))
    } else {
      setCart((prev) => [...prev, { productId: product.id, productName: product.name, quantity: 1, unitPrice: product.price, total: product.price }])
    }
    setSearch("")
  }

  function updateQty(productId: number, delta: number) {
    setCart((prev) => prev.map((i) => {
      if (i.productId !== productId) return i
      const newQty = Math.max(1, i.quantity + delta)
      return { ...i, quantity: newQty, total: newQty * i.unitPrice }
    }))
  }

  function removeItem(productId: number) {
    setCart((prev) => prev.filter((i) => i.productId !== productId))
  }

  function handleCompleteBill() {
    const now = new Date()
    const billNumber = `BILL-${now.toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")}`
    setSavedBill({ billNumber, date: now.toLocaleString() })
    setReceiptOpen(true)
  }

  function handlePrint() {
    if (receiptRef.current) {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`<html><head><title>Receipt</title><style>body{font-family:monospace;max-width:320px;margin:0 auto;padding:20px}table{width:100%;border-collapse:collapse}td{padding:2px 0}hr{border:none;border-top:1px dashed #000}.right{text-align:right}.center{text-align:center}</style></head><body>${receiptRef.current.innerHTML}</body></html>`)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  function handleNewBill() {
    setCart([])
    setCustomerName("")
    setCustomerPhone("")
    setDiscount(0)
    setCashReceived(0)
    setSavedBill(null)
    setReceiptOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Bill</h1>
        <p className="text-muted-foreground">Create a new bill for a customer</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Product Search + Cart */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Product Search */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Add Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search by name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              {searchResults.length > 0 && (
                <div className="mt-2 rounded-md border">
                  {searchResults.map((p) => (
                    <button key={p.id} className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-muted/50 transition-colors" onClick={() => addToCart(p.id)}>
                      <div className="text-left">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.sku} -- Stock: {p.currentStock}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Rs.{p.price}</span>
                        <Plus className="h-4 w-4 text-primary" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cart Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingCart className="h-4 w-4" />
                Cart ({cart.length} items)
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              {cart.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-muted-foreground">Search and add products above</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.productId, -1)}><Minus className="h-3 w-3" /></Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.productId, 1)}><Plus className="h-3 w-3" /></Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">Rs.{item.unitPrice}</TableCell>
                        <TableCell className="text-right font-medium">Rs.{item.total}</TableCell>
                        <TableCell><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(item.productId)}><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Customer Info + Bill Summary + Payment */}
        <div className="flex flex-col gap-4">
          {/* Customer Info */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Customer Info</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5"><Label htmlFor="cName">Name</Label><Input id="cName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name" /></div>
              <div className="flex flex-col gap-1.5"><Label htmlFor="cPhone">Phone</Label><Input id="cPhone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" /></div>
            </CardContent>
          </Card>

          {/* Bill Summary */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Bill Summary</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>Rs.{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax ({taxRate}%)</span><span>Rs.{taxAmount.toFixed(2)}</span></div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Discount</span>
                <Input type="number" className="h-7 w-24 text-right text-sm" value={discount} onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))} />
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span>Rs.{totalAmount.toFixed(2)}</span></div>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Payment</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <Button variant={paymentMethod === "cash" ? "default" : "outline"} onClick={() => setPaymentMethod("cash")} className="flex items-center gap-2">
                  <Banknote className="h-4 w-4" /> Cash
                </Button>
                <Button variant={paymentMethod === "upi" ? "default" : "outline"} onClick={() => setPaymentMethod("upi")} className="flex items-center gap-2">
                  <QrCode className="h-4 w-4" /> UPI
                </Button>
              </div>

              {paymentMethod === "cash" && (
                <div className="flex flex-col gap-2">
                  <Label>Cash Received</Label>
                  <Input type="number" value={cashReceived || ""} onChange={(e) => setCashReceived(Number(e.target.value))} placeholder="Enter amount" />
                  {cashReceived > 0 && cashReceived >= totalAmount && (
                    <div className="rounded-md bg-emerald-50 p-2 text-sm text-emerald-700">
                      Change: <span className="font-bold">Rs.{changeReturned.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === "upi" && (
                <div className="flex flex-col items-center gap-2">
                  {storeSettings.upiQrImage ? (
                    <img src={storeSettings.upiQrImage} alt="UPI QR Code" className="h-48 w-48 rounded-md border" />
                  ) : (
                    <div className="flex h-48 w-48 items-center justify-center rounded-md border border-dashed text-center text-sm text-muted-foreground">
                      <div>
                        <QrCode className="mx-auto mb-2 h-8 w-8" />
                        <p>No QR uploaded</p>
                        <p className="text-xs">Manager can upload in Settings</p>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">Ask customer to scan and pay Rs.{totalAmount.toFixed(2)}</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" disabled={cart.length === 0 || (paymentMethod === "cash" && cashReceived < totalAmount)} onClick={handleCompleteBill}>
                Complete Bill
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bill Created Successfully</DialogTitle>
            <DialogDescription>Bill {savedBill?.billNumber}</DialogDescription>
          </DialogHeader>
          <div ref={receiptRef} className="rounded-md border p-4 font-mono text-xs">
            <div className="text-center">
              <p className="text-sm font-bold">{storeSettings.storeName}</p>
              <p>{storeSettings.storeAddress}</p>
              <p>{storeSettings.storePhone}</p>
              <hr className="my-2 border-dashed" />
              <p className="font-bold">{savedBill?.billNumber}</p>
              <p>{savedBill?.date}</p>
              <p>Biller: {user?.name}</p>
              {customerName && <p>Customer: {customerName}</p>}
              <hr className="my-2 border-dashed" />
            </div>
            <table className="w-full">
              <thead><tr><td className="font-bold">Item</td><td className="font-bold text-center">Qty</td><td className="font-bold text-right">Amt</td></tr></thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.productId}><td>{item.productName}</td><td className="text-center">{item.quantity}</td><td className="text-right">Rs.{item.total}</td></tr>
                ))}
              </tbody>
            </table>
            <hr className="my-2 border-dashed" />
            <div className="flex justify-between"><span>Subtotal</span><span>Rs.{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Tax ({taxRate}%)</span><span>Rs.{taxAmount.toFixed(2)}</span></div>
            {discount > 0 && <div className="flex justify-between"><span>Discount</span><span>-Rs.{discount.toFixed(2)}</span></div>}
            <hr className="my-1 border-dashed" />
            <div className="flex justify-between font-bold text-sm"><span>TOTAL</span><span>Rs.{totalAmount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Paid via</span><span className="uppercase">{paymentMethod}</span></div>
            {paymentMethod === "cash" && (
              <>
                <div className="flex justify-between"><span>Cash</span><span>Rs.{cashReceived.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Change</span><span>Rs.{changeReturned.toFixed(2)}</span></div>
              </>
            )}
            <hr className="my-2 border-dashed" />
            <p className="text-center">{storeSettings.receiptFooter}</p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Print</Button>
            <Button onClick={handleNewBill}>New Bill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
