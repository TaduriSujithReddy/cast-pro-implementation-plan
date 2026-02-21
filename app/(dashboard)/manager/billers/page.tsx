"use client"

import { useState } from "react"
import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export default function BillersPage() {
  const { data: billers } = useSWR("/api/profiles?role=biller", fetcher)
  const { data: bills } = useSWR("/api/bills", fetcher)

  if (!billers || !bills) return <div className="flex flex-col gap-6"><h1 className="text-2xl font-bold">Biller Management</h1><Skeleton className="h-96 rounded-xl" /></div>

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Biller Management</h1>
        <p className="text-muted-foreground">{billers.length} billers registered</p>
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0 pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Bills Created</TableHead>
                <TableHead>Total Sales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billers.map((b: { id: string; name: string; email: string }) => {
                const bBills = bills.filter((bill: { biller_id: string }) => bill.biller_id === b.id)
                const totalSales = bBills.reduce((s: number, bill: { total: number }) => s + Number(bill.total), 0)
                return (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell className="text-muted-foreground">{b.email}</TableCell>
                    <TableCell>{bBills.length}</TableCell>
                    <TableCell>Rs.{totalSales.toLocaleString()}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
