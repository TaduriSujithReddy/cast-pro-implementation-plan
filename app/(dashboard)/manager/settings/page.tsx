"use client"

import { useState, useRef } from "react"
import { storeSettings as initialSettings } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Store, Upload, Save, QrCode, X } from "lucide-react"
import type { StoreSettings } from "@/lib/types"

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(initialSettings)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function update(key: keyof StoreSettings, value: string | number) {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function handleQrUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setSettings((prev) => ({ ...prev, upiQrImage: reader.result as string }))
      setSaved(false)
    }
    reader.readAsDataURL(file)
  }

  function removeQr() {
    setSettings((prev) => ({ ...prev, upiQrImage: null }))
    setSaved(false)
  }

  function handleSave() {
    // In production this would persist to the database
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Store Settings</h1>
          <p className="text-muted-foreground">Manage store configuration, tax, and payment settings</p>
        </div>
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" />{saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Store className="h-4 w-4" />Store Information</CardTitle>
            <CardDescription>Basic details that appear on receipts</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="storeName">Store Name</Label>
              <Input id="storeName" value={settings.storeName} onChange={(e) => update("storeName", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="storeAddress">Address</Label>
              <Textarea id="storeAddress" value={settings.storeAddress} onChange={(e) => update("storeAddress", e.target.value)} rows={2} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="storePhone">Phone</Label>
              <Input id="storePhone" value={settings.storePhone} onChange={(e) => update("storePhone", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Tax & Receipt */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tax & Receipt</CardTitle>
            <CardDescription>Tax rate and receipt customization</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input id="taxRate" type="number" min={0} max={100} step={0.5} value={settings.taxRate} onChange={(e) => update("taxRate", parseFloat(e.target.value) || 0)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="receiptFooter">Receipt Footer Message</Label>
              <Textarea id="receiptFooter" value={settings.receiptFooter} onChange={(e) => update("receiptFooter", e.target.value)} rows={3} placeholder="Thank you message shown at bottom of receipts" />
            </div>
          </CardContent>
        </Card>

        {/* UPI QR Code */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><QrCode className="h-4 w-4" />UPI QR Code</CardTitle>
            <CardDescription>Upload a QR code image that will be displayed to customers during UPI payment at the billing counter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              {settings.upiQrImage ? (
                <div className="relative">
                  <img src={settings.upiQrImage} alt="UPI QR Code" className="h-48 w-48 rounded-lg border object-contain p-2" />
                  <Button variant="destructive" size="icon" className="absolute -right-2 -top-2 h-6 w-6 rounded-full" onClick={removeQr}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
                  <div className="text-center text-sm text-muted-foreground">
                    <QrCode className="mx-auto mb-2 h-8 w-8" />
                    <p>No QR uploaded</p>
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleQrUpload} />
                <Button variant="outline" onClick={() => fileRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />{settings.upiQrImage ? "Replace QR Image" : "Upload QR Image"}
                </Button>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Upload your UPI payment QR code (PNG, JPG). This image will be shown to customers when they select UPI as the payment method during billing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
