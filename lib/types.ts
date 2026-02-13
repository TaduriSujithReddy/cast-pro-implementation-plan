export type Role = "manager" | "biller"

export interface User {
  id: number
  name: string
  email: string
  role: Role
  isActive: boolean
}

export interface Vendor {
  id: number
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  performanceRating: number
  totalOrders: number
  onTimeDelivery: number
  isActive: boolean
}

export interface Product {
  id: number
  name: string
  sku: string
  category: string
  price: number
  costPrice: number
  currentStock: number
  threshold: number
  unit: string
  vendorId: number | null
  isActive: boolean
}

export interface BillItem {
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Bill {
  id: number
  billNumber: string
  billerId: number
  billerName: string
  customerName: string
  customerPhone: string
  subtotal: number
  taxRate: number
  taxAmount: number
  discount: number
  totalAmount: number
  paymentMethod: "cash" | "upi"
  paymentStatus: string
  cashReceived: number
  changeReturned: number
  items: BillItem[]
  createdAt: string
}

export interface StockAlert {
  id: number
  productId: number
  productName: string
  alertType: string
  severity: "critical" | "warning" | "info"
  message: string
  acknowledged: boolean
  createdAt: string
}

export interface Notification {
  id: number
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  isRead: boolean
  createdAt: string
}

export interface StoreSettings {
  storeName: string
  storeAddress: string
  storePhone: string
  taxRate: number
  receiptFooter: string
  upiQrImage: string | null
}

export interface ForecastPoint {
  date: string
  actual: number | null
  predicted: number
  lower: number
  upper: number
}

export interface CategoryForecast {
  category: string
  currentDemand: number
  predictedDemand: number
  changePercent: number
  confidence: number
}
