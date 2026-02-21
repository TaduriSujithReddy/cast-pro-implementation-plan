"use client"

import { useState, useMemo } from "react"
import useSWR, { mutate } from "swr"
import { fetcher } from "@/lib/fetcher"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, CheckCircle2, Info, XOctagon } from "lucide-react"

const severityConfig: Record<string, { icon: React.ReactNode; badge: string; className: string }> = {
  critical: { icon: <XOctagon className="h-4 w-4" />, badge: "Critical", className: "bg-red-100 text-red-700" },
  warning:  { icon: <AlertTriangle className="h-4 w-4" />, badge: "Warning", className: "bg-amber-100 text-amber-700" },
  info:     { icon: <Info className="h-4 w-4" />, badge: "Info", className: "bg-blue-100 text-blue-700" },
}

export default function StockAlertsPage() {
  const { data: alerts } = useSWR("/api/alerts", fetcher)
  const [filter, setFilter] = useState("all")

  const allAlerts = alerts ?? []

  const filtered = useMemo(() => {
    if (filter === "all") return allAlerts
    if (filter === "unacknowledged") return allAlerts.filter((a: { is_acknowledged: boolean }) => !a.is_acknowledged)
    return allAlerts.filter((a: { severity: string }) => a.severity === filter)
  }, [allAlerts, filter])

  const critCount = allAlerts.filter((a: { severity: string; is_acknowledged: boolean }) => a.severity === "critical" && !a.is_acknowledged).length
  const warnCount = allAlerts.filter((a: { severity: string; is_acknowledged: boolean }) => a.severity === "warning" && !a.is_acknowledged).length
  const infoCount = allAlerts.filter((a: { severity: string; is_acknowledged: boolean }) => a.severity === "info" && !a.is_acknowledged).length

  async function acknowledge(id: number) {
    await fetch("/api/alerts", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    mutate("/api/alerts")
  }

  async function acknowledgeAll() {
    await fetch("/api/alerts", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ acknowledge_all: true }) })
    mutate("/api/alerts")
  }

  if (!alerts) return <div className="flex flex-col gap-6"><h1 className="text-2xl font-bold">Stock Alerts</h1><Skeleton className="h-96 rounded-xl" /></div>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Stock Alerts</h1><p className="text-muted-foreground">Monitor inventory levels and reorder points</p></div>
        <Button variant="outline" size="sm" onClick={acknowledgeAll}><CheckCircle2 className="mr-2 h-4 w-4" />Acknowledge All</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-red-200"><CardContent className="pt-6"><div className="flex items-center gap-2"><XOctagon className="h-5 w-5 text-red-600" /><span className="text-sm text-muted-foreground">Critical</span></div><div className="mt-1 text-2xl font-bold text-red-600">{critCount}</div></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="pt-6"><div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-600" /><span className="text-sm text-muted-foreground">Warnings</span></div><div className="mt-1 text-2xl font-bold text-amber-600">{warnCount}</div></CardContent></Card>
        <Card className="border-blue-200"><CardContent className="pt-6"><div className="flex items-center gap-2"><Info className="h-5 w-5 text-blue-600" /><span className="text-sm text-muted-foreground">Informational</span></div><div className="mt-1 text-2xl font-bold text-blue-600">{infoCount}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Alert Log</CardTitle>
            <Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Alerts</SelectItem><SelectItem value="unacknowledged">Unacknowledged</SelectItem><SelectItem value="critical">Critical Only</SelectItem><SelectItem value="warning">Warnings Only</SelectItem><SelectItem value="info">Info Only</SelectItem></SelectContent></Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Severity</TableHead><TableHead>Product</TableHead><TableHead>Message</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No alerts found</TableCell></TableRow>
                ) : filtered.map((alert: { id: number; severity: string; products: { name: string } | null; message: string; created_at: string; is_acknowledged: boolean }) => {
                  const cfg = severityConfig[alert.severity] || severityConfig.info
                  return (
                    <TableRow key={alert.id} className={alert.is_acknowledged ? "opacity-60" : ""}>
                      <TableCell><Badge className={`flex w-fit items-center gap-1 ${cfg.className}`}>{cfg.icon}{cfg.badge}</Badge></TableCell>
                      <TableCell className="font-medium">{alert.products?.name ?? "Unknown"}</TableCell>
                      <TableCell className="max-w-[300px] text-sm">{alert.message}</TableCell>
                      <TableCell className="text-sm">{new Date(alert.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{alert.is_acknowledged ? <Badge variant="secondary">Acknowledged</Badge> : <Badge className="bg-orange-100 text-orange-700">Pending</Badge>}</TableCell>
                      <TableCell>{!alert.is_acknowledged && <Button variant="ghost" size="sm" onClick={() => acknowledge(alert.id)}><CheckCircle2 className="mr-1 h-3 w-3" />Ack</Button>}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
