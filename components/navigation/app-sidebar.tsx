"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  Users,
  Truck,
  BarChart3,
  FileText,
  Settings,
  User,
  LogOut,
  Package2,
} from "lucide-react"

const managerNav = [
  { label: "Dashboard",        href: "/manager",                 icon: LayoutDashboard },
  { label: "Inventory",        href: "/inventory",               icon: Package },
  { label: "Stock Alerts",     href: "/manager/stock-alerts",    icon: AlertTriangle },
  { label: "Demand Forecast",  href: "/manager/demand-forecast", icon: TrendingUp },
  { label: "Vendors",          href: "/manager/vendors",         icon: Truck },
  { label: "Vendor Analytics", href: "/manager/vendor-analytics",icon: BarChart3 },
  { label: "Transactions",     href: "/manager/transactions",    icon: Receipt },
  { label: "Billers",          href: "/manager/billers",         icon: Users },
  { label: "Reports",          href: "/manager/reports",         icon: FileText },
  { label: "Settings",         href: "/manager/settings",        icon: Settings },
]

const billerNav = [
  { label: "Dashboard",    href: "/biller",              icon: LayoutDashboard },
  { label: "New Bill",     href: "/biller/billing",      icon: ShoppingCart },
  { label: "Transactions", href: "/biller/transactions", icon: Receipt },
  { label: "Payments",     href: "/biller/payments",     icon: CreditCard },
  { label: "Inventory",    href: "/inventory",           icon: Package },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const items = user?.role === "manager" ? managerNav : billerNav

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <Link href={user?.role === "manager" ? "/manager" : "/biller"} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package2 className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold">CastPro</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{user?.role === "manager" ? "Management" : "Billing"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = pathname === item.href || (item.href !== "/manager" && item.href !== "/biller" && pathname.startsWith(item.href))
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex flex-col gap-2">
          <Link href="/profile" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent">
            <User className="h-4 w-4" />
            <div className="flex flex-col">
              <span className="font-medium leading-tight">{user?.name}</span>
              <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
            </div>
          </Link>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
