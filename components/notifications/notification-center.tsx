"use client"

import { useState, useEffect } from "react"
import { Bell, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface AlertNotification {
  id: number
  message: string
  severity: string
  created_at: string
  is_acknowledged: boolean
}

export function NotificationCenter() {
  const [items, setItems] = useState<AlertNotification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from("stock_alerts")
        .select("id, message, severity, created_at, is_acknowledged")
        .order("created_at", { ascending: false })
        .limit(20)
      setItems(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const unread = items.filter((n) => !n.is_acknowledged).length

  async function markRead(id: number) {
    const supabase = createClient()
    await supabase.from("stock_alerts").update({ is_acknowledged: true }).eq("id", id)
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_acknowledged: true } : n)))
  }

  async function markAllRead() {
    const supabase = createClient()
    const ids = items.filter((n) => !n.is_acknowledged).map((n) => n.id)
    if (ids.length > 0) {
      await supabase.from("stock_alerts").update({ is_acknowledged: true }).in("id", ids)
    }
    setItems((prev) => prev.map((n) => ({ ...n, is_acknowledged: true })))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              {unread}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="text-sm font-semibold">Notifications</h4>
          {unread > 0 && (
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto">
          {loading && <p className="p-4 text-center text-sm text-muted-foreground">Loading...</p>}
          {!loading && items.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">No notifications</p>}
          {items.map((n) => (
            <div key={n.id} className={cn("flex items-start gap-3 border-b px-4 py-3 last:border-0", !n.is_acknowledged && "bg-muted/50")}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Badge variant={n.severity === "critical" ? "destructive" : n.severity === "warning" ? "secondary" : "outline"} className="text-[10px]">
                    {n.severity}
                  </Badge>
                </div>
                <p className="mt-1 text-sm leading-tight">{n.message}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</p>
              </div>
              {!n.is_acknowledged && (
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => markRead(n.id)}>
                  <Check className="h-3 w-3" />
                </Button>
              )}
              {n.is_acknowledged && <Badge variant="secondary" className="shrink-0 text-[10px]">Read</Badge>}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
