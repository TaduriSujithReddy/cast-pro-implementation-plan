"use client"

import { vendors } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts"

const barData = vendors.map((v) => ({
  name: v.name.split(" ")[0],
  orders: v.totalOrders,
  onTime: v.onTimeDelivery,
}))

const radarData = vendors.map((v) => ({
  vendor: v.name.split(" ")[0],
  rating: v.performanceRating * 20,
  reliability: v.totalOrders > 0 ? (v.onTimeDelivery / v.totalOrders) * 100 : 0,
  volume: Math.min(100, (v.totalOrders / 150) * 100),
}))

export default function VendorAnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vendor Analytics</h1>
        <p className="text-muted-foreground">Compare vendor performance across key metrics</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Volume Comparison</CardTitle>
            <CardDescription>Total orders vs on-time deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" fill="var(--color-chart-1)" name="Total Orders" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="onTime" fill="var(--color-chart-2)" name="On-Time" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Radar</CardTitle>
            <CardDescription>Multi-dimensional vendor comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid className="stroke-border" />
                  <PolarAngleAxis dataKey="vendor" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis tick={{ fontSize: 10 }} />
                  <Radar name="Rating" dataKey="rating" stroke="var(--color-chart-1)" fill="var(--color-chart-1)" fillOpacity={0.2} />
                  <Radar name="Reliability" dataKey="reliability" stroke="var(--color-chart-2)" fill="var(--color-chart-2)" fillOpacity={0.2} />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vendors.map((v) => {
          const reliability = v.totalOrders > 0 ? Math.round((v.onTimeDelivery / v.totalOrders) * 100) : 0
          return (
            <Card key={v.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{v.name}</CardTitle>
                <CardDescription>{v.address}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Rating</span><span className="font-medium">{v.performanceRating}/5</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Orders</span><span className="font-medium">{v.totalOrders}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">On-Time Delivery</span><span className="font-medium">{reliability}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Contact</span><span className="font-medium">{v.contactPerson}</span></div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
