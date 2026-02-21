"use client"

import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function VendorAnalyticsPage() {
  const { data: vendors } = useSWR("/api/vendors", fetcher)

  if (!vendors) return <div className="flex flex-col gap-6"><h1 className="text-2xl font-bold">Vendor Analytics</h1><Skeleton className="h-96 rounded-xl" /></div>

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vendor Analytics</h1>
        <p className="text-muted-foreground">Compare vendor information across key metrics</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vendors.map((v: { id: number; name: string; address: string; rating: number; contact: string; email: string }) => (
          <Card key={v.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{v.name}</CardTitle>
              <CardDescription>{v.address || "No address"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Rating</span><span className="font-medium">{Number(v.rating)}/5</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Contact</span><span className="font-medium">{v.contact || "N/A"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium">{v.email || "N/A"}</span></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
