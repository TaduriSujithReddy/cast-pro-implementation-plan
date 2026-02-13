import type { User, Vendor, Product, Bill, BillItem, StockAlert, Notification, StoreSettings } from "./types"

// ── Users ──
export const users: User[] = [
  { id: 1, name: "Rahul Sharma",  email: "manager@castpro.com", role: "manager", isActive: true },
  { id: 2, name: "Priya Patel",   email: "biller@castpro.com",  role: "biller",  isActive: true },
  { id: 3, name: "Amit Singh",    email: "biller2@castpro.com",  role: "biller",  isActive: true },
]

export const passwords: Record<string, string> = {
  "manager@castpro.com": "manager123",
  "biller@castpro.com":  "biller123",
  "biller2@castpro.com": "biller123",
}

// ── Vendors ──
export const vendors: Vendor[] = [
  { id: 1, name: "Fresh Farms Ltd",   contactPerson: "Suresh Kumar", email: "suresh@freshfarms.com",   phone: "+91 99887 76655", address: "Pune, Maharashtra",    performanceRating: 4.5, totalOrders: 120, onTimeDelivery: 108, isActive: true },
  { id: 2, name: "Spice World Inc",   contactPerson: "Meena Reddy",  email: "meena@spiceworld.com",    phone: "+91 98765 11223", address: "Hyderabad, Telangana", performanceRating: 4.2, totalOrders: 95,  onTimeDelivery: 80,  isActive: true },
  { id: 3, name: "Daily Essentials",  contactPerson: "Ravi Gupta",   email: "ravi@dailyessentials.com", phone: "+91 91234 56789", address: "Delhi NCR",            performanceRating: 3.8, totalOrders: 78,  onTimeDelivery: 62,  isActive: true },
  { id: 4, name: "Premium Goods Co",  contactPerson: "Anita Desai",  email: "anita@premiumgoods.com",  phone: "+91 88776 65544", address: "Mumbai, Maharashtra",  performanceRating: 4.7, totalOrders: 150, onTimeDelivery: 142, isActive: true },
  { id: 5, name: "Green Valley Agro", contactPerson: "Vikram Joshi", email: "vikram@greenvalley.com",  phone: "+91 77665 54433", address: "Nashik, Maharashtra",  performanceRating: 3.5, totalOrders: 60,  onTimeDelivery: 45,  isActive: true },
]

// ── Products ──
export const products: Product[] = [
  { id: 1,  name: "Basmati Rice 5kg",      sku: "GRN-001", category: "Grains",     price: 320, costPrice: 260, currentStock: 45,  threshold: 20, unit: "bag", vendorId: 1, isActive: true },
  { id: 2,  name: "Toor Dal 1kg",          sku: "GRN-002", category: "Grains",     price: 140, costPrice: 105, currentStock: 8,   threshold: 15, unit: "kg",  vendorId: 1, isActive: true },
  { id: 3,  name: "Wheat Flour 10kg",      sku: "GRN-003", category: "Grains",     price: 420, costPrice: 340, currentStock: 32,  threshold: 10, unit: "bag", vendorId: 1, isActive: true },
  { id: 4,  name: "Turmeric Powder 200g",  sku: "SPC-001", category: "Spices",     price: 55,  costPrice: 38,  currentStock: 60,  threshold: 25, unit: "pcs", vendorId: 2, isActive: true },
  { id: 5,  name: "Red Chilli Powder 1kg", sku: "SPC-002", category: "Spices",     price: 180, costPrice: 130, currentStock: 3,   threshold: 10, unit: "kg",  vendorId: 2, isActive: true },
  { id: 6,  name: "Cumin Seeds 500g",      sku: "SPC-003", category: "Spices",     price: 120, costPrice: 85,  currentStock: 40,  threshold: 15, unit: "pcs", vendorId: 2, isActive: true },
  { id: 7,  name: "Sunflower Oil 5L",      sku: "OIL-001", category: "Oils",       price: 650, costPrice: 520, currentStock: 18,  threshold: 12, unit: "can", vendorId: 3, isActive: true },
  { id: 8,  name: "Mustard Oil 1L",        sku: "OIL-002", category: "Oils",       price: 190, costPrice: 145, currentStock: 55,  threshold: 20, unit: "btl", vendorId: 3, isActive: true },
  { id: 9,  name: "Sugar 5kg",             sku: "ESS-001", category: "Essentials", price: 240, costPrice: 195, currentStock: 28,  threshold: 15, unit: "bag", vendorId: 3, isActive: true },
  { id: 10, name: "Salt 1kg",              sku: "ESS-002", category: "Essentials", price: 25,  costPrice: 18,  currentStock: 100, threshold: 30, unit: "pcs", vendorId: 4, isActive: true },
  { id: 11, name: "Tea Leaves 500g",       sku: "BEV-001", category: "Beverages",  price: 250, costPrice: 185, currentStock: 22,  threshold: 10, unit: "pcs", vendorId: 4, isActive: true },
  { id: 12, name: "Coffee Powder 200g",    sku: "BEV-002", category: "Beverages",  price: 320, costPrice: 240, currentStock: 15,  threshold: 8,  unit: "pcs", vendorId: 4, isActive: true },
  { id: 13, name: "Washing Powder 1kg",    sku: "CLN-001", category: "Cleaning",   price: 165, costPrice: 120, currentStock: 35,  threshold: 12, unit: "pcs", vendorId: 3, isActive: true },
  { id: 14, name: "Dish Soap 500ml",       sku: "CLN-002", category: "Cleaning",   price: 85,  costPrice: 58,  currentStock: 48,  threshold: 20, unit: "btl", vendorId: 3, isActive: true },
  { id: 15, name: "Milk Powder 500g",      sku: "DRY-001", category: "Dairy",      price: 280, costPrice: 210, currentStock: 5,   threshold: 10, unit: "pcs", vendorId: 1, isActive: true },
]

// ── Bills ──
const billItems1: BillItem[] = [
  { productId: 1, productName: "Basmati Rice 5kg", quantity: 2, unitPrice: 320, total: 640 },
  { productId: 4, productName: "Turmeric Powder 200g", quantity: 2, unitPrice: 55, total: 110 },
  { productId: 8, productName: "Mustard Oil 1L", quantity: 1, unitPrice: 190, total: 190 },
  { productId: 10, productName: "Salt 1kg", quantity: 2, unitPrice: 25, total: 50 },
]
const billItems2: BillItem[] = [
  { productId: 9, productName: "Sugar 5kg", quantity: 1, unitPrice: 240, total: 240 },
  { productId: 11, productName: "Tea Leaves 500g", quantity: 1, unitPrice: 250, total: 250 },
  { productId: 14, productName: "Dish Soap 500ml", quantity: 1, unitPrice: 85, total: 85 },
]
const billItems3: BillItem[] = [
  { productId: 7, productName: "Sunflower Oil 5L", quantity: 1, unitPrice: 650, total: 650 },
  { productId: 3, productName: "Wheat Flour 10kg", quantity: 1, unitPrice: 420, total: 420 },
  { productId: 6, productName: "Cumin Seeds 500g", quantity: 2, unitPrice: 120, total: 240 },
  { productId: 13, productName: "Washing Powder 1kg", quantity: 1, unitPrice: 165, total: 165 },
]
const billItems4: BillItem[] = [
  { productId: 12, productName: "Coffee Powder 200g", quantity: 1, unitPrice: 320, total: 320 },
  { productId: 10, productName: "Salt 1kg", quantity: 1, unitPrice: 25, total: 25 },
]
const billItems5: BillItem[] = [
  { productId: 1, productName: "Basmati Rice 5kg", quantity: 3, unitPrice: 320, total: 960 },
  { productId: 7, productName: "Sunflower Oil 5L", quantity: 1, unitPrice: 650, total: 650 },
  { productId: 9, productName: "Sugar 5kg", quantity: 2, unitPrice: 240, total: 480 },
  { productId: 5, productName: "Red Chilli Powder 1kg", quantity: 1, unitPrice: 180, total: 180 },
]

export const bills: Bill[] = [
  { id: 1, billNumber: "BILL-20260201-001", billerId: 2, billerName: "Priya Patel", customerName: "Ajay Kumar",    customerPhone: "+91 9876500001", subtotal: 990,  taxRate: 5, taxAmount: 49.50,  discount: 0,   totalAmount: 1039.50, paymentMethod: "cash", paymentStatus: "completed", cashReceived: 1100, changeReturned: 60.50, items: billItems1, createdAt: "2026-02-01T10:30:00" },
  { id: 2, billNumber: "BILL-20260201-002", billerId: 2, billerName: "Priya Patel", customerName: "Sunita Devi",   customerPhone: "+91 9876500002", subtotal: 575,  taxRate: 5, taxAmount: 28.75,  discount: 0,   totalAmount: 603.75,  paymentMethod: "upi",  paymentStatus: "completed", cashReceived: 0,    changeReturned: 0,     items: billItems2, createdAt: "2026-02-01T14:15:00" },
  { id: 3, billNumber: "BILL-20260202-001", billerId: 3, billerName: "Amit Singh",  customerName: "Manoj Tiwari",  customerPhone: "+91 9876500003", subtotal: 1475, taxRate: 5, taxAmount: 73.75,  discount: 50,  totalAmount: 1498.75, paymentMethod: "cash", paymentStatus: "completed", cashReceived: 1500, changeReturned: 1.25,  items: billItems3, createdAt: "2026-02-02T09:45:00" },
  { id: 4, billNumber: "BILL-20260203-001", billerId: 2, billerName: "Priya Patel", customerName: "Kavita Sharma", customerPhone: "+91 9876500004", subtotal: 345,  taxRate: 5, taxAmount: 17.25,  discount: 0,   totalAmount: 362.25,  paymentMethod: "upi",  paymentStatus: "completed", cashReceived: 0,    changeReturned: 0,     items: billItems4, createdAt: "2026-02-03T11:00:00" },
  { id: 5, billNumber: "BILL-20260204-001", billerId: 2, billerName: "Priya Patel", customerName: "Rajan Mehta",   customerPhone: "+91 9876500005", subtotal: 2270, taxRate: 5, taxAmount: 113.50, discount: 100, totalAmount: 2283.50, paymentMethod: "cash", paymentStatus: "completed", cashReceived: 2300, changeReturned: 16.50, items: billItems5, createdAt: "2026-02-04T16:20:00" },
]

// ── Stock Alerts ──
export const stockAlerts: StockAlert[] = [
  { id: 1, productId: 2,  productName: "Toor Dal 1kg",          alertType: "low_stock", severity: "critical", message: "Stock critically low (8 remaining, threshold 15)", acknowledged: false, createdAt: "2026-02-13T08:00:00" },
  { id: 2, productId: 5,  productName: "Red Chilli Powder 1kg", alertType: "low_stock", severity: "critical", message: "Stock critically low (3 remaining, threshold 10)", acknowledged: false, createdAt: "2026-02-13T08:00:00" },
  { id: 3, productId: 15, productName: "Milk Powder 500g",      alertType: "low_stock", severity: "critical", message: "Stock critically low (5 remaining, threshold 10)", acknowledged: false, createdAt: "2026-02-13T08:00:00" },
  { id: 4, productId: 7,  productName: "Sunflower Oil 5L",      alertType: "low_stock", severity: "warning",  message: "Stock running low (18 remaining, threshold 12)",   acknowledged: false, createdAt: "2026-02-12T12:00:00" },
  { id: 5, productId: 12, productName: "Coffee Powder 200g",    alertType: "low_stock", severity: "warning",  message: "Stock nearing threshold (15 remaining, threshold 8)", acknowledged: true,  createdAt: "2026-02-11T09:00:00" },
  { id: 6, productId: 1,  productName: "Basmati Rice 5kg",      alertType: "forecast",  severity: "info",     message: "Demand expected to increase 20% next month",       acknowledged: false, createdAt: "2026-02-10T15:00:00" },
]

// ── Notifications ──
export const notifications: Notification[] = [
  { id: 1, title: "Critical Stock Alert", message: "Red Chilli Powder 1kg is critically low (3 units)", type: "error",   isRead: false, createdAt: "2026-02-13T08:05:00" },
  { id: 2, title: "New Bill Created",     message: "Bill #BILL-20260204-001 created by Priya Patel",    type: "success", isRead: false, createdAt: "2026-02-04T16:20:00" },
  { id: 3, title: "Vendor Rating Updated",message: "Premium Goods Co rating updated to 4.7",            type: "info",    isRead: true,  createdAt: "2026-02-03T10:00:00" },
  { id: 4, title: "Forecast Ready",       message: "February demand forecast is available for review",  type: "info",    isRead: true,  createdAt: "2026-02-01T06:00:00" },
]

// ── Store Settings ──
export const storeSettings: StoreSettings = {
  storeName: "CastPro Store",
  storeAddress: "123 Market Street, Mumbai 400001",
  storePhone: "+91 98765 43210",
  taxRate: 5,
  receiptFooter: "Thank you for shopping with CastPro!",
  upiQrImage: null,
}

// ── Sales chart data (last 30 days) ──
export const salesChartData = Array.from({ length: 30 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - 29 + i)
  return {
    date: d.toISOString().slice(0, 10),
    sales: Math.round(1500 + Math.random() * 3500 + (i > 20 ? 800 : 0)),
    orders: Math.round(3 + Math.random() * 8),
  }
})

// ── Categories list ──
export const categories = [...new Set(products.map((p) => p.category))]
