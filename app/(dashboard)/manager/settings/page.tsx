"use client"

import { useState, useEffect } from "react"
import useSWR, { mutate } from "swr"
import { fetcher } from "@/lib/fetcher"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Store, Save } from "lucide-react"

export default function SettingsPage() {
  const { data: settings } = useSWR("/api/settings", fetcher)
  const [storeName, setStoreName] = useState("")
  const [taxRate, setTaxRate] = useState(5)
  const [receiptFooter, setReceiptFooter] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settings) {
      setStoreName(settings.store_name || "")
      setTaxRate(Number(settings.tax_rate) || 5)
      setReceiptFooter(settings.receipt_footer || "")
    }
  }, [settings])

  async function handleSave() {
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ store_name: storeName, tax_rate: taxRate, receipt_footer: receiptFooter }),
    })
    mutate("/api/settings")
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!settings) return <div className="flex flex-col gap-6"><h1 className="text-2xl font-bold">Store Settings</h1><Skeleton className="h-96 rounded-xl" /></div>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Store Settings</h1><p className="text-muted-foreground">Manage store configuration, tax, and receipt settings</p></div>
        <Button onClick={handleSave} className="flex items-center gap-2"><Save className="h-4 w-4" />{saved ? "Saved!" : "Save Changes"}</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Store className="h-4 w-4" />Store Information</CardTitle><CardDescription>Basic details that appear on receipts</CardDescription></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5"><Label htmlFor="storeName">Store Name</Label><Input id="storeName" value={storeName} onChange={(e) => { setStoreName(e.target.value); setSaved(false) }} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Tax & Receipt</CardTitle><CardDescription>Tax rate and receipt customization</CardDescription></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5"><Label htmlFor="taxRate">Tax Rate (%)</Label><Input id="taxRate" type="number" min={0} max={100} step={0.5} value={taxRate} onChange={(e) => { setTaxRate(parseFloat(e.target.value) || 0); setSaved(false) }} /></div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="receiptFooter">Receipt Footer Message</Label><Textarea id="receiptFooter" value={receiptFooter} onChange={(e) => { setReceiptFooter(e.target.value); setSaved(false) }} rows={3} placeholder="Thank you message shown at bottom of receipts" /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
