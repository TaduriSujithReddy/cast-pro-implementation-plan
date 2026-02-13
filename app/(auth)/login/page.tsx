"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Package } from "lucide-react"

export default function LoginPage() {
  const { login, loading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const err = await login(email, password)
    if (err) setError(err)
  }

  function fillDemo(role: "manager" | "biller") {
    if (role === "manager") {
      setEmail("manager@castpro.com")
      setPassword("manager123")
    } else {
      setEmail("biller@castpro.com")
      setPassword("biller123")
    }
    setError(null)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Package className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-bold text-balance">CastPro</CardTitle>
          <CardDescription>Supply Chain Demand Forecasting & Billing</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@castpro.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 flex flex-col gap-2">
            <p className="text-center text-xs text-muted-foreground">Demo Accounts</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => fillDemo("manager")}>
                Manager
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => fillDemo("biller")}>
                Biller
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
