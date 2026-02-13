import type { ForecastPoint, CategoryForecast } from "./types"

function generateForecast(productName: string, baseValue: number): ForecastPoint[] {
  const points: ForecastPoint[] = []
  const now = new Date()
  // Past 30 days (actual data)
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const noise = (Math.random() - 0.5) * baseValue * 0.3
    const seasonal = Math.sin((d.getDate() / 30) * Math.PI * 2) * baseValue * 0.15
    const val = Math.max(0, Math.round(baseValue + noise + seasonal))
    points.push({
      date: d.toISOString().slice(0, 10),
      actual: val,
      predicted: val + Math.round((Math.random() - 0.5) * baseValue * 0.1),
      lower: val - Math.round(baseValue * 0.15),
      upper: val + Math.round(baseValue * 0.15),
    })
  }
  // Future 14 days (predicted only)
  for (let i = 1; i <= 14; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + i)
    const trend = baseValue * (1 + i * 0.005)
    const seasonal = Math.sin(((d.getDate()) / 30) * Math.PI * 2) * baseValue * 0.15
    const predicted = Math.round(trend + seasonal)
    points.push({
      date: d.toISOString().slice(0, 10),
      actual: null,
      predicted,
      lower: predicted - Math.round(baseValue * 0.2),
      upper: predicted + Math.round(baseValue * 0.2),
    })
  }
  return points
}

export const productForecasts: Record<string, ForecastPoint[]> = {
  "Basmati Rice 5kg":      generateForecast("Basmati Rice 5kg", 12),
  "Toor Dal 1kg":          generateForecast("Toor Dal 1kg", 8),
  "Sunflower Oil 5L":      generateForecast("Sunflower Oil 5L", 5),
  "Sugar 5kg":             generateForecast("Sugar 5kg", 10),
  "Tea Leaves 500g":       generateForecast("Tea Leaves 500g", 7),
  "Red Chilli Powder 1kg": generateForecast("Red Chilli Powder 1kg", 6),
}

export const categoryForecasts: CategoryForecast[] = [
  { category: "Grains",     currentDemand: 85,  predictedDemand: 102, changePercent: 20,  confidence: 87 },
  { category: "Spices",     currentDemand: 60,  predictedDemand: 68,  changePercent: 13,  confidence: 82 },
  { category: "Oils",       currentDemand: 30,  predictedDemand: 35,  changePercent: 17,  confidence: 79 },
  { category: "Essentials", currentDemand: 95,  predictedDemand: 100, changePercent: 5,   confidence: 91 },
  { category: "Beverages",  currentDemand: 40,  predictedDemand: 48,  changePercent: 20,  confidence: 75 },
  { category: "Cleaning",   currentDemand: 50,  predictedDemand: 52,  changePercent: 4,   confidence: 88 },
  { category: "Dairy",      currentDemand: 25,  predictedDemand: 32,  changePercent: 28,  confidence: 72 },
]

export const forecastAccuracy = {
  mape: 8.3,
  rmse: 2.1,
  r2: 0.89,
  lastTrained: "2026-02-10",
}
