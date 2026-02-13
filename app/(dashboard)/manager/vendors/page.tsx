"use client"

import { useState } from "react"
import { vendors as initialVendors } from "@/lib/mock-data"
import type { Vendor } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Search, Pencil, Trash2, Star } from "lucide-react"

const emptyVendor = { name: "", contactPerson: "", email: "", phone: "", address: "", performanceRating: 0, totalOrders: 0, onTimeDelivery: 0 }

export default function VendorsPage() {
  const [items, setItems] = useState<Vendor[]>(initialVendors)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Vendor | null>(null)
  const [form, setForm] = useState(emptyVendor)

  const filtered = items.filter((v) => v.isActive && (v.name.toLowerCase().includes(search.toLowerCase()) || v.contactPerson.toLowerCase().includes(search.toLowerCase())))

  function openAdd() {
    setEditing(null)
    setForm(emptyVendor)
    setDialogOpen(true)
  }
  function openEdit(v: Vendor) {
    setEditing(v)
    setForm({ name: v.name, contactPerson: v.contactPerson, email: v.email, phone: v.phone, address: v.address, performanceRating: v.performanceRating, totalOrders: v.totalOrders, onTimeDelivery: v.onTimeDelivery })
    setDialogOpen(true)
  }
  function handleSave() {
    if (editing) {
      setItems((prev) => prev.map((v) => (v.id === editing.id ? { ...v, ...form } : v)))
    } else {
      const newId = Math.max(...items.map((v) => v.id)) + 1
      setItems((prev) => [...prev, { ...form, id: newId, isActive: true } as Vendor])
    }
    setDialogOpen(false)
  }
  function handleDelete(id: number) {
    setItems((prev) => prev.map((v) => (v.id === id ? { ...v, isActive: false } : v)))
  }

  function ratingStars(r: number) {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(r) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
    ))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendor Management</h1>
          <p className="text-muted-foreground">{filtered.length} active vendors</p>
        </div>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Add Vendor</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search vendors..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">On-Time %</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{v.name}</p>
                        <p className="text-xs text-muted-foreground">{v.address}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{v.contactPerson}</p>
                      <p className="text-xs text-muted-foreground">{v.email}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">{ratingStars(v.performanceRating)}<span className="ml-1 text-sm">{v.performanceRating}</span></div>
                    </TableCell>
                    <TableCell className="text-right">{v.totalOrders}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={v.totalOrders > 0 && (v.onTimeDelivery / v.totalOrders) >= 0.9 ? "default" : "secondary"}>
                        {v.totalOrders > 0 ? Math.round((v.onTimeDelivery / v.totalOrders) * 100) : 0}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(v)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(v.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Vendor" : "Add Vendor"}</DialogTitle>
            <DialogDescription>{editing ? "Update vendor information" : "Add a new vendor to the system"}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="flex flex-col gap-2"><Label>Contact Person</Label><Input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="flex flex-col gap-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="flex flex-col gap-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? "Update" : "Add Vendor"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
