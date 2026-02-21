"use client"

import { useState, useMemo } from "react"
import useSWR, { mutate } from "swr"
import { fetcher } from "@/lib/fetcher"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, Pencil, Trash2 } from "lucide-react"

const CATEGORIES = ["Grains", "Dairy", "Vegetables", "Spices", "Beverages"]

const emptyForm = { name: "", sku: "", category: "Grains", price: 0, cost_price: 0, stock: 0, min_stock: 10, unit: "pcs", vendor_id: "" }

export default function InventoryPage() {
  const { user } = useAuth()
  const isManager = user?.role === "manager"
  const { data: products } = useSWR("/api/products", fetcher)
  const { data: vendors } = useSWR("/api/vendors", fetcher)
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)

  const items = products ?? []

  const filtered = useMemo(() => {
    return items.filter((p: { name: string; sku: string; category: string }) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
      const matchCat = catFilter === "all" || p.category === catFilter
      return matchSearch && matchCat
    })
  }, [items, search, catFilter])

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(p: { id: number; name: string; sku: string; category: string; price: number; cost_price: number; stock: number; min_stock: number; unit: string; vendor_id: number | null }) {
    setEditingId(p.id)
    setForm({ name: p.name, sku: p.sku, category: p.category, price: p.price, cost_price: p.cost_price, stock: p.stock, min_stock: p.min_stock, unit: p.unit, vendor_id: p.vendor_id ? String(p.vendor_id) : "" })
    setDialogOpen(true)
  }

  async function handleSave() {
    const payload = { ...form, price: Number(form.price), cost_price: Number(form.cost_price), stock: Number(form.stock), min_stock: Number(form.min_stock), vendor_id: form.vendor_id ? Number(form.vendor_id) : null }
    if (editingId) {
      await fetch(`/api/products/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    } else {
      await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    }
    mutate("/api/products")
    setDialogOpen(false)
  }

  async function handleDelete(id: number) {
    await fetch(`/api/products/${id}`, { method: "DELETE" })
    mutate("/api/products")
  }

  if (!products) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">{filtered.length} products{catFilter !== "all" ? ` in ${catFilter}` : ""}</p>
        </div>
        {isManager && <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Add Product</Button>}
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Level</TableHead>
                {isManager && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p: { id: number; name: string; sku: string; category: string; price: number; cost_price: number; stock: number; min_stock: number; unit: string; vendor_id: number | null }) => {
                const level = Math.min(100, Math.max(0, (p.stock / (p.min_stock * 2.5)) * 100))
                const isCritical = p.stock <= p.min_stock / 2
                const isLow = p.stock <= p.min_stock
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                    <TableCell><Badge variant="secondary">{p.category}</Badge></TableCell>
                    <TableCell className="text-right">Rs.{Number(p.price)}</TableCell>
                    <TableCell className="text-right">
                      <span className={isCritical ? "text-red-600 font-semibold" : isLow ? "text-amber-600 font-semibold" : ""}>{p.stock}</span>
                      <span className="text-muted-foreground"> / {p.min_stock}</span>
                    </TableCell>
                    <TableCell className="min-w-24">
                      <Progress value={level} className={`h-2 ${isCritical ? "[&>div]:bg-red-500" : isLow ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500"}`} />
                    </TableCell>
                    {isManager && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
              {filtered.length === 0 && <TableRow><TableCell colSpan={isManager ? 7 : 6} className="text-center text-muted-foreground py-8">No products found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogDescription>{editingId ? "Update product details" : "Add a new product to inventory"}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="flex flex-col gap-2"><Label>SKU</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Vendor</Label>
                <Select value={form.vendor_id} onValueChange={(v) => setForm({ ...form, vendor_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                  <SelectContent>
                    {(vendors ?? []).map((v: { id: number; name: string }) => <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-2"><Label>Price</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
              <div className="flex flex-col gap-2"><Label>Cost Price</Label><Input type="number" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: Number(e.target.value) })} /></div>
              <div className="flex flex-col gap-2"><Label>Unit</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2"><Label>Current Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></div>
              <div className="flex flex-col gap-2"><Label>Min Stock</Label><Input type="number" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: Number(e.target.value) })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingId ? "Update" : "Add Product"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
