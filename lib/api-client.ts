/**
 * API client for communicating with the FastAPI backend.
 * Used by lib/mock-data.ts when NEXT_PUBLIC_API_URL is set.
 *
 * In development: NEXT_PUBLIC_API_URL=http://localhost:8000/api
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("castpro_token")
}

export function setToken(token: string) {
  localStorage.setItem("castpro_token", token)
}

export function clearToken() {
  localStorage.removeItem("castpro_token")
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `API Error ${res.status}`)
  }
  return res.json()
}

// ── Auth ──
export const api = {
  login: (email: string, password: string) =>
    request<{ access_token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<any>("/auth/me"),

  // ── Products ──
  getProducts: () => request<any[]>("/products"),
  getCategories: () => request<string[]>("/products/categories"),
  createProduct: (data: any) =>
    request<any>("/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id: number, data: any) =>
    request<any>(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProduct: (id: number) =>
    request<any>(`/products/${id}`, { method: "DELETE" }),

  // ── Vendors ──
  getVendors: () => request<any[]>("/vendors"),
  createVendor: (data: any) =>
    request<any>("/vendors", { method: "POST", body: JSON.stringify(data) }),
  updateVendor: (id: number, data: any) =>
    request<any>(`/vendors/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteVendor: (id: number) =>
    request<any>(`/vendors/${id}`, { method: "DELETE" }),

  // ── Bills ──
  getBills: (billerId?: number) =>
    request<any[]>(`/bills${billerId ? `?biller_id=${billerId}` : ""}`),
  getBill: (id: number) => request<any>(`/bills/${id}`),
  createBill: (data: any) =>
    request<any>("/bills", { method: "POST", body: JSON.stringify(data) }),

  // ── Stock Alerts ──
  getStockAlerts: (severity?: string) =>
    request<any[]>(`/stock-alerts${severity ? `?severity=${severity}` : ""}`),
  acknowledgeAlert: (id: number) =>
    request<any>(`/stock-alerts/${id}/acknowledge`, { method: "PUT" }),
  generateAlerts: () =>
    request<any>("/stock-alerts/generate", { method: "POST" }),

  // ── Notifications ──
  getNotifications: () => request<any[]>("/notifications"),
  markNotificationRead: (id: number) =>
    request<any>(`/notifications/${id}/read`, { method: "PUT" }),

  // ── Settings ──
  getSettings: () => request<any>("/settings"),
  updateSettings: (data: any) =>
    request<any>("/settings", { method: "PUT", body: JSON.stringify(data) }),

  // ── Sales Chart ──
  getSalesChart: (days?: number) =>
    request<any[]>(`/sales-chart${days ? `?days=${days}` : ""}`),

  // ── Users ──
  getUsers: (role?: string) =>
    request<any[]>(`/users${role ? `?role=${role}` : ""}`),

  // ── Health ──
  health: () => request<{ status: string }>("/health"),
}
