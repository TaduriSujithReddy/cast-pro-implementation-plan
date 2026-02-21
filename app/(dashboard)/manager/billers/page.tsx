"use client"

import { useState } from "react"
import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Trash2, Loader2, UserPlus, Copy, Check } from "lucide-react"

export default function BillersPage() {
  const { data: billers, error, mutate } = useSWR("/api/billers", fetcher)
  const { data: bills } = useSWR("/api/bills", fetcher)

  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Track created credentials for display
  const [createdCreds, setCreatedCreds] = useState<{ email: string; password: string } | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSaving(true)
    try {
      const res = await fetch("/api/billers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFormError(data.error || "Failed to create biller")
        return
      }
      // Show created credentials
      setCreatedCreds({ email, password })
      setName("")
      setEmail("")
      setPassword("")
      mutate()
    } catch {
      setFormError("Network error")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      const res = await fetch(`/api/billers/${id}`, { method: "DELETE" })
      if (res.ok) mutate()
    } finally {
      setDeleting(null)
    }
  }

  function handleCopy() {
    if (!createdCreds) return
    navigator.clipboard.writeText(`Email: ${createdCreds.email}\nPassword: ${createdCreds.password}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!billers) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Biller Management</h1>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Biller Management</h1>
          <p className="text-muted-foreground">{billers.length} biller{billers.length !== 1 ? "s" : ""} registered</p>
        </div>

        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setFormError(null); setCreatedCreds(null); setCopied(false) } }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Biller</Button>
          </DialogTrigger>
          <DialogContent>
            {createdCreds ? (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    Biller Created Successfully
                  </DialogTitle>
                  <DialogDescription>
                    Share these credentials with the biller. They will use them to log in.
                  </DialogDescription>
                </DialogHeader>
                <div className="rounded-lg border bg-muted/50 p-4 font-mono text-sm">
                  <p><span className="text-muted-foreground">Email:</span> {createdCreds.email}</p>
                  <p><span className="text-muted-foreground">Password:</span> {createdCreds.password}</p>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="outline" onClick={handleCopy}>
                    {copied ? <><Check className="mr-2 h-4 w-4" />Copied</> : <><Copy className="mr-2 h-4 w-4" />Copy Credentials</>}
                  </Button>
                  <Button onClick={() => { setOpen(false); setCreatedCreds(null) }}>Done</Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Add New Biller</DialogTitle>
                  <DialogDescription>
                    Create login credentials for a new biller. They will use these to access the billing dashboard.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="flex flex-col gap-4">
                  {formError && (
                    <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</div>
                  )}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="biller-name">Full Name</Label>
                    <Input id="biller-name" placeholder="Biller name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="biller-email">Email</Label>
                    <Input id="biller-email" type="email" placeholder="biller@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="biller-password">Password</Label>
                    <Input id="biller-password" type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={saving}>
                      {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Biller"}
                    </Button>
                  </DialogFooter>
                </form>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0 pt-0">
          {billers.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <UserPlus className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-muted-foreground">No billers yet. Click "Add Biller" to create one.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Bills Created</TableHead>
                  <TableHead>Total Sales</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billers.map((b: { id: string; name: string; email: string; created_at: string }) => {
                  const bBills = bills?.filter((bill: { biller_id: string }) => bill.biller_id === b.id) || []
                  const totalSales = bBills.reduce((s: number, bill: { total: number }) => s + Number(bill.total), 0)
                  return (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell className="text-muted-foreground">{b.email}</TableCell>
                      <TableCell><Badge variant="secondary">{bBills.length}</Badge></TableCell>
                      <TableCell>Rs.{totalSales.toLocaleString()}</TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete biller</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Biller</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete <strong>{b.name}</strong> ({b.email}) and their login access. Their existing bills will be preserved. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDelete(b.id)}
                                disabled={deleting === b.id}
                              >
                                {deleting === b.id ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</> : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
