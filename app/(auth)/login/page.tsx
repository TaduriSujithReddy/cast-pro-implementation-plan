"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Loader2 } from "lucide-react"

export default function LoginPage() {
  const { login, loading } = useAuth()
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)

  const [regName, setRegName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regConfirm, setRegConfirm] = useState("")
  const [regError, setRegError] = useState<string | null>(null)
  const [regSuccess, setRegSuccess] = useState(false)
  const [regLoading, setRegLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError(null)
    const err = await login(loginEmail, loginPassword)
    if (err) setLoginError(err)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setRegError(null)
    setRegSuccess(false)

    if (regPassword !== regConfirm) {
      setRegError("Passwords do not match")
      return
    }
    if (regPassword.length < 6) {
      setRegError("Password must be at least 6 characters")
      return
    }

    setRegLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setRegError(data.error || "Registration failed")
        return
      }
      setRegSuccess(true)
      setRegName("")
      setRegEmail("")
      setRegPassword("")
      setRegConfirm("")
    } catch {
      setRegError("Network error")
    } finally {
      setRegLoading(false)
    }
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
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Create Account</TabsTrigger>
            </TabsList>

            {/* ── Sign In Tab ── */}
            <TabsContent value="login" className="mt-4">
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                {loginError && (
                  <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{loginError}</div>
                )}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="you@company.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : "Sign In"}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Billers: use the credentials provided by your manager.
                </p>
              </form>
            </TabsContent>

            {/* ── Create Manager Account Tab ── */}
            <TabsContent value="register" className="mt-4">
              {regSuccess ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Manager Account Created</h3>
                  <p className="text-sm text-muted-foreground">
                    You can now sign in with your credentials. Once logged in, you can create biller accounts from the Billers page.
                  </p>
                  <Button variant="outline" onClick={() => setRegSuccess(false)} className="mt-2">
                    Back to Sign In
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                  {regError && (
                    <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{regError}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Register as the organization manager. Only one manager account is allowed.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="reg-name">Full Name</Label>
                    <Input id="reg-name" placeholder="John Doe" value={regName} onChange={(e) => setRegName(e.target.value)} required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input id="reg-email" type="email" placeholder="manager@company.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input id="reg-password" type="password" placeholder="Min 6 characters" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="reg-confirm">Confirm Password</Label>
                    <Input id="reg-confirm" type="password" value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={regLoading}>
                    {regLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Manager Account"}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  )
}
