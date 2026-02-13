"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { DynamicBreadcrumbs } from "./breadcrumbs"
import { NotificationCenter } from "@/components/notifications/notification-center"

export function DashboardHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mx-2 h-4" />
      <DynamicBreadcrumbs />
      <div className="ml-auto">
        <NotificationCenter />
      </div>
    </header>
  )
}
