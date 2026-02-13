"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Fragment } from "react"

const labels: Record<string, string> = {
  manager: "Manager",
  biller: "Biller",
  inventory: "Inventory",
  "stock-alerts": "Stock Alerts",
  "demand-forecast": "Demand Forecast",
  vendors: "Vendors",
  "vendor-analytics": "Vendor Analytics",
  billers: "Billers",
  reports: "Reports",
  settings: "Settings",
  billing: "New Bill",
  transactions: "Transactions",
  payments: "Payments",
  profile: "Profile",
}

export function DynamicBreadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((seg, idx) => {
          const href = "/" + segments.slice(0, idx + 1).join("/")
          const label = labels[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1)
          const isLast = idx === segments.length - 1

          return (
            <Fragment key={href}>
              {idx > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
