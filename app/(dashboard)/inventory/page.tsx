"use client"

import { useState, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { products as initialProducts, categories, vendors } from "@/lib/mock-data"
import type { Product } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Plus, Search, Pencil, Trash2 } from "lucide-react"

const emptyProduct: Omit<Product, "id" | "isActive"> = {
  name: "", sku: "", category: "Grains", price: 0, costPrice: 0, currentStock: 0, threshold: 10, unit: "pcs", vendorId: null,
}

export default function InventoryPage() {
  const { user } = useAuth()
  const isManager = user?.role === "manager"
  const [items, setItems] = useState<Product[]>(initialProducts)
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyProduct)

  const filtered = useMemo(() => {
    return items.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
      const matchCat = catFilter === "all" || p.category === catFilter
      return matchSearch && matchCat && p.isActive
    })
  }, [items, search, catFilter])

  function openAdd() {
    setEditing(null)
    setForm(emptyProduct)
    setDialogOpen(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm({ name: p.name, sku: p.sku, category: p.category, price: p.price, costPrice: p.costPrice, currentStock: p.currentStock, threshold: p.threshold, unit: p.unit, vendorId: p.vendorId })
    setDialogOpen(true)
  }

  function handleSave() {
    if (editing) {
      setItems((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...form } : p)))
    } else {
      const newId = Math.max(...items.map((p) => p.id)) + 1
      setItems((prev) => [...prev, { ...form, id: newId, isActive: true } as Product])
    }
    setDialogOpen(false)
  }

  function handleDelete(id: number) {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: false } : p)))
  }

  function stockLevel(p: Product) {
    const ratio = p.currentStock / (p.threshold * 2.5)
    const pct = Math.min(100, Math.max(0, ratio * 100))
    return pct
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">{filtered.length} products{catFilter !== "all" ? ` in ${catFilter}` : ""}</p>
        </div>
        {isManager && (
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
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
              {filtered.map((p) => {
                const level = stockLevel(p)
                const isCritical = p.currentStock <= p.threshold / 2
                const isLow = p.currentStock <= p.threshold
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                    <TableCell><Badge variant="secondary">{p.category}</Badge></TableCell>
                    <TableCell className="text-right">Rs.{p.price}</TableCell>
                    <TableCell className="text-right">
                      <span className={isCritical ? "text-red-600 font-semibold" : isLow ? "text-amber-600 font-semibold" : ""}>
                        {p.currentStock}
                      </span>
                      <span className="text-muted-foreground"> / {p.threshold}</span>
                    </TableCell>
                    <TableCell className="min-w-24">
                      <Progress value={level} className={`h-2 ${isCritical ? "[&>div]:bg-red-500" : isLow ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500"}`} />
                    </TableCell>
                    {isManager && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isManager ? 7 : 6} className="text-center text-muted-foreground py-8">No products found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogDescription>{editing ? "Update product details" : "Add a new product to inventory"}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="pName">Name</Label>
                <Input id="pName" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="pSku">SKU</Label>
                <Input id="pSku" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Vendor</Label>
                <Select value={String(form.vendorId ?? "")} onValueChange={(v) => setForm({ ...form, vendorId: v ? Number(v) : null })}>
                  <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                  <SelectContent>
                    {vendors.map((v) => <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Price</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Cost Price</Label>
                <Input type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Unit</Label>
                <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Current Stock</Label>
                <Input type="number" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: Number(e.target.value) })} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Threshold</Label>
                <Input type="number" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? "Update" : "Add Product"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
