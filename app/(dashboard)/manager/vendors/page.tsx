"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { fetcher } from "@/lib/fetcher"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, Pencil, Trash2, Star } from "lucide-react"

const emptyForm = { name: "", contact: "", email: "", address: "" }

export default function VendorsPage() {
  const { data: vendors } = useSWR("/api/vendors", fetcher)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)

  const items = vendors ?? []
  const filtered = items.filter((v: { name: string; contact: string }) =>
    v.name.toLowerCase().includes(search.toLowerCase()) || (v.contact || "").toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() { setEditingId(null); setForm(emptyForm); setDialogOpen(true) }
  function openEdit(v: { id: number; name: string; contact: string; email: string; address: string }) {
    setEditingId(v.id)
    setForm({ name: v.name, contact: v.contact || "", email: v.email || "", address: v.address || "" })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (editingId) {
      await fetch(`/api/vendors/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    } else {
      await fetch("/api/vendors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    }
    mutate("/api/vendors")
    setDialogOpen(false)
  }

  async function handleDelete(id: number) {
    await fetch(`/api/vendors/${id}`, { method: "DELETE" })
    mutate("/api/vendors")
  }

  function ratingStars(r: number) {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(r) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
    ))
  }

  if (!vendors) return <div className="flex flex-col gap-6"><h1 className="text-2xl font-bold">Vendor Management</h1><Skeleton className="h-96 rounded-xl" /></div>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Vendor Management</h1><p className="text-muted-foreground">{filtered.length} active vendors</p></div>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Add Vendor</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-4"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search vendors..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Vendor</TableHead><TableHead>Contact</TableHead><TableHead>Rating</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.map((v: { id: number; name: string; contact: string; email: string; address: string; rating: number }) => (
                  <TableRow key={v.id}>
                    <TableCell><div><p className="font-medium">{v.name}</p><p className="text-xs text-muted-foreground">{v.address}</p></div></TableCell>
                    <TableCell><p className="text-sm">{v.contact}</p><p className="text-xs text-muted-foreground">{v.email}</p></TableCell>
                    <TableCell><div className="flex items-center gap-1">{ratingStars(Number(v.rating))}<span className="ml-1 text-sm">{Number(v.rating)}</span></div></TableCell>
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
          <DialogHeader><DialogTitle>{editingId ? "Edit Vendor" : "Add Vendor"}</DialogTitle><DialogDescription>{editingId ? "Update vendor information" : "Add a new vendor"}</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="flex flex-col gap-2"><Label>Contact</Label><Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></div>
            </div>
            <div className="flex flex-col gap-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="flex flex-col gap-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave}>{editingId ? "Update" : "Add Vendor"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
