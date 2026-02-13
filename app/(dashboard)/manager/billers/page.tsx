"use client"

import { useState } from "react"
import { users as allUsers, bills } from "@/lib/mock-data"
import type { User } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Plus, UserCheck, UserX } from "lucide-react"

export default function BillersPage() {
  const [billersList, setBillersList] = useState<User[]>(allUsers.filter((u) => u.role === "biller"))
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ name: "", email: "" })

  function handleAdd() {
    const newId = Math.max(...allUsers.map((u) => u.id)) + billersList.length + 1
    setBillersList((prev) => [...prev, { id: newId, name: form.name, email: form.email, role: "biller", isActive: true }])
    setDialogOpen(false)
    setForm({ name: "", email: "" })
  }

  function toggleActive(id: number) {
    setBillersList((prev) => prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b)))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Biller Management</h1>
          <p className="text-muted-foreground">{billersList.filter((b) => b.isActive).length} active billers</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Biller</Button>
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0 pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Bills Created</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billersList.map((b) => {
                const bBills = bills.filter((bill) => bill.billerId === b.id)
                const totalSales = bBills.reduce((s, bill) => s + bill.totalAmount, 0)
                return (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell className="text-muted-foreground">{b.email}</TableCell>
                    <TableCell>{bBills.length}</TableCell>
                    <TableCell>Rs.{totalSales.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={b.isActive ? "default" : "secondary"}>{b.isActive ? "Active" : "Inactive"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => toggleActive(b.id)}>
                        {b.isActive ? <UserX className="mr-1 h-3.5 w-3.5" /> : <UserCheck className="mr-1 h-3.5 w-3.5" />}
                        {b.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Biller</DialogTitle>
            <DialogDescription>Create a new biller account</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2"><Label>Full Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="flex flex-col gap-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.name || !form.email}>Add Biller</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
