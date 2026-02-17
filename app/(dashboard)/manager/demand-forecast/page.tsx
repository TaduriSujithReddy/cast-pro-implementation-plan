"use client"

import { useState, useEffect, useCallback } from "react"
import { productForecasts, categoryForecasts, forecastAccuracy } from "@/lib/forecast-data"
import { api } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Activity, TrendingUp, Target, Brain, RefreshCw } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from "recharts"

const BAR_COLORS = ["#1E40AF", "#3B82F6", "#60A5FA", "#93C5FD", "#10B981", "#F59E0B", "#EF4444"]

interface ForecastProduct { id: number; name: string; category: string }
interface ForecastPoint { date: string; actual: number | null; predicted: number; lower: number; upper: number }
interface CategoryForecast { category: string; currentDemand: number; predictedDemand: number; changePercent: number; confidence: number }
interface Accuracy { mape: number; rmse: number; r2: number; lastTrained: string; productsModeled?: number }

export default function DemandForecastPage() {
  const [useApi, setUseApi] = useState(false)
  const [loading, setLoading] = useState(true)
  const [retraining, setRetraining] = useState(false)

  // API state
  const [apiProducts, setApiProducts] = useState<ForecastProduct[]>([])
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [forecastData, setForecastData] = useState<ForecastPoint[]>([])
  const [catForecasts, setCatForecasts] = useState<CategoryForecast[]>([])
  const [accuracy, setAccuracy] = useState<Accuracy>({ mape: 0, rmse: 0, r2: 0, lastTrained: "" })
  const [selectedProductName, setSelectedProductName] = useState("")

  // Mock fallback state
  const mockProductNames = Object.keys(productForecasts)
  const [selectedMock, setSelectedMock] = useState(mockProductNames[0])

  // Check if backend is available on mount
  useEffect(() => {
    api.health()
      .then(() => {
        setUseApi(true)
        loadApiProducts()
      })
      .catch(() => {
        setUseApi(false)
        setLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadApiProducts() {
    try {
      const [products, acc] = await Promise.all([
        api.getForecastProducts(),
        api.getForecastAccuracy(),
      ])
      setApiProducts(products)
      setAccuracy(acc)
      if (products.length > 0) {
        setSelectedProductId(products[0].id)
        setSelectedProductName(products[0].name)
        await loadProductForecast(products[0].id)
      }
      const cats = await api.getCategoryForecasts()
      setCatForecasts(cats)
    } catch {
      setUseApi(false)
    } finally {
      setLoading(false)
    }
  }

  const loadProductForecast = useCallback(async (productId: number, retrain = false) => {
    try {
      const endpoint = retrain
        ? `/forecast/product/${productId}?retrain=true`
        : `/forecast/product/${productId}`
      const result = retrain
        ? await api.getProductForecast(productId, 14)
        : await api.getProductForecast(productId)
      setForecastData(result.data || [])
      if (result.metrics) {
        setAccuracy((prev) => ({ ...prev, ...result.metrics, lastTrained: result.trained_at }))
      }
    } catch (err) {
      console.error("Failed to load forecast:", err)
    }
  }, [])

  async function handleRetrain() {
    if (!selectedProductId) return
    setRetraining(true)
    await loadProductForecast(selectedProductId, true)
    const acc = await api.getForecastAccuracy()
    setAccuracy(acc)
    setRetraining(false)
  }

  function handleProductChange(val: string) {
    if (useApi) {
      const id = Number(val)
      setSelectedProductId(id)
      const prod = apiProducts.find((p) => p.id === id)
      setSelectedProductName(prod?.name || "")
      loadProductForecast(id)
    } else {
      setSelectedMock(val)
    }
  }

  // Determine which data to show
  const chartData = useApi ? forecastData : productForecasts[selectedMock]
  const catData = useApi ? catForecasts : categoryForecasts
  const acc = useApi ? accuracy : forecastAccuracy
  const isApiMode = useApi

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Demand Forecast</h1>
          <p className="text-muted-foreground">Loading Prophet model data...</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
        <Card><CardContent className="pt-6"><Skeleton className="h-[350px] w-full" /></CardContent></Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Demand Forecast</h1>
          <p className="text-muted-foreground">
            {isApiMode
              ? "Facebook Prophet ML-powered demand predictions from real sales data"
              : "Simulated forecast data (connect FastAPI backend for real Prophet predictions)"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isApiMode ? "default" : "secondary"}>
            {isApiMode ? "Prophet ML" : "Mock Data"}
          </Badge>
          {isApiMode && (
            <Button variant="outline" size="sm" onClick={handleRetrain} disabled={retraining}>
              <RefreshCw className={`mr-1 h-4 w-4 ${retraining ? "animate-spin" : ""}`} />
              {retraining ? "Training..." : "Retrain"}
            </Button>
          )}
        </div>
      </div>

      {/* Accuracy Metrics */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">MAPE</span>
            </div>
            <div className="mt-1 text-2xl font-bold">{acc.mape}%</div>
            <p className="text-xs text-muted-foreground">Mean Absolute % Error</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-600" />
              <span className="text-sm text-muted-foreground">RMSE</span>
            </div>
            <div className="mt-1 text-2xl font-bold">{acc.rmse}</div>
            <p className="text-xs text-muted-foreground">Root Mean Square Error</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-600" />
              <span className="text-sm text-muted-foreground">R-Squared</span>
            </div>
            <div className="mt-1 text-2xl font-bold">{acc.r2}</div>
            <p className="text-xs text-muted-foreground">Model fit score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Last Trained</span>
            </div>
            <div className="mt-1 text-2xl font-bold">{acc.lastTrained || "N/A"}</div>
            <p className="text-xs text-muted-foreground">
              {isApiMode && accuracy.productsModeled
                ? `${accuracy.productsModeled} products modeled`
                : "Model refresh date"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Product-level forecast chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Product Demand Forecast
              {isApiMode && selectedProductName && (
                <span className="ml-2 font-normal text-muted-foreground">
                  - {selectedProductName}
                </span>
              )}
            </CardTitle>
            <Select
              value={isApiMode ? String(selectedProductId) : selectedMock}
              onValueChange={handleProductChange}
            >
              <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                {isApiMode
                  ? apiProducts.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                    ))
                  : mockProductNames.map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  value !== null ? `${value} units` : "N/A",
                  name,
                ]}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="upper"
                name="Upper Bound"
                stroke="transparent"
                fill="#93C5FD"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="lower"
                name="Lower Bound"
                stroke="transparent"
                fill="#FFFFFF"
                fillOpacity={1}
              />
              <Area
                type="monotone"
                dataKey="predicted"
                name="Predicted (Prophet)"
                stroke="#1E40AF"
                fill="transparent"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Area
                type="monotone"
                dataKey="actual"
                name="Actual Sales"
                stroke="#10B981"
                fill="#10B98120"
                strokeWidth={2}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {isApiMode
              ? "Green = actual daily sales | Dashed blue = Prophet prediction | Shaded band = 80% confidence interval"
              : "Solid green = actual | Dashed blue = predicted | Shaded = confidence interval (mock data)"}
          </p>
        </CardContent>
      </Card>

      {/* Category overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Category Demand Overview</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={catData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="currentDemand" name="Current (7d)" fill="#93C5FD" radius={[0, 4, 4, 0]} />
                <Bar dataKey="predictedDemand" name="Predicted (7d)" radius={[0, 4, 4, 0]}>
                  {catData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
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
                {catData.map((cf) => (
                  <TableRow key={cf.category}>
                    <TableCell className="font-medium">{cf.category}</TableCell>
                    <TableCell className="text-right">
                      <Badge className={
                        cf.changePercent > 15
                          ? "bg-red-100 text-red-700"
                          : cf.changePercent > 5
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                      }>
                        {cf.changePercent > 0 ? "+" : ""}{cf.changePercent}%
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
