"use client"

import { useState } from "react"
import { Bell, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { notifications as initialNotifications } from "@/lib/mock-data"
import type { Notification } from "@/lib/types"
import { cn } from "@/lib/utils"

export function NotificationCenter() {
  const [items, setItems] = useState<Notification[]>(initialNotifications)
  const unread = items.filter((n) => !n.isRead).length

  function markRead(id: number) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))
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
          {items.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">No notifications</p>}
          {items.map((n) => (
            <div key={n.id} className={cn("flex items-start gap-3 border-b px-4 py-3 last:border-0", !n.isRead && "bg-muted/50")}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">{n.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{new Date(n.createdAt).toLocaleDateString()}</p>
              </div>
              {!n.isRead && (
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => markRead(n.id)}>
                  <Check className="h-3 w-3" />
                </Button>
              )}
              {n.isRead && <Badge variant="secondary" className="shrink-0 text-[10px]">Read</Badge>}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
