"use client"

import { useState } from "react"
import { productForecasts, categoryForecasts, forecastAccuracy } from "@/lib/forecast-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Activity, TrendingUp, Target, Brain } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from "recharts"

const BAR_COLORS = ["#1E40AF", "#3B82F6", "#60A5FA", "#93C5FD", "#10B981", "#F59E0B", "#EF4444"]

export default function DemandForecastPage() {
  const productNames = Object.keys(productForecasts)
  const [selectedProduct, setSelectedProduct] = useState(productNames[0])
  const data = productForecasts[selectedProduct]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Demand Forecast</h1>
        <p className="text-muted-foreground">AI-powered demand predictions using historical data</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">MAPE</span>
            </div>
            <div className="mt-1 text-2xl font-bold">{forecastAccuracy.mape}%</div>
            <p className="text-xs text-muted-foreground">Mean Absolute % Error</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-600" />
              <span className="text-sm text-muted-foreground">RMSE</span>
            </div>
            <div className="mt-1 text-2xl font-bold">{forecastAccuracy.rmse}</div>
            <p className="text-xs text-muted-foreground">Root Mean Square Error</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-600" />
              <span className="text-sm text-muted-foreground">R-Squared</span>
            </div>
            <div className="mt-1 text-2xl font-bold">{forecastAccuracy.r2}</div>
            <p className="text-xs text-muted-foreground">Model fit score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Last Trained</span>
            </div>
            <div className="mt-1 text-2xl font-bold">{forecastAccuracy.lastTrained}</div>
            <p className="text-xs text-muted-foreground">Model refresh date</p>
          </CardContent>
        </Card>
      </div>

      {/* Product-level forecast chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Product Demand Forecast</CardTitle>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                {productNames.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="upper" name="Upper Bound" stroke="transparent" fill="#93C5FD" fillOpacity={0.3} />
              <Area type="monotone" dataKey="lower" name="Lower Bound" stroke="transparent" fill="#FFFFFF" fillOpacity={1} />
              <Area type="monotone" dataKey="predicted" name="Predicted" stroke="#1E40AF" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
              <Area type="monotone" dataKey="actual" name="Actual" stroke="#10B981" fill="#10B98120" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Solid green = actual sales | Dashed blue = predicted | Shaded = confidence interval (future 14 days have no actual data)
          </p>
        </CardContent>
      </Card>

      {/* Category overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Category Demand Overview</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryForecasts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="currentDemand" name="Current" fill="#93C5FD" radius={[0, 4, 4, 0]} />
                <Bar dataKey="predictedDemand" name="Predicted" radius={[0, 4, 4, 0]}>
                  {categoryForecasts.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Category Details</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead className="text-right">Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryForecasts.map((cf) => (
                  <TableRow key={cf.category}>
                    <TableCell className="font-medium">{cf.category}</TableCell>
                    <TableCell className="text-right">
                      <Badge className={cf.changePercent > 15 ? "bg-red-100 text-red-700" : cf.changePercent > 5 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}>
                        +{cf.changePercent}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{cf.confidence}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
