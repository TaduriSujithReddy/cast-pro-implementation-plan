"use client"

import { useState } from "react"
import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Mail, Shield, Save, Lock, Receipt, IndianRupee } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  const { data: bills } = useSWR(user ? `/api/bills?biller_id=${user.id}` : null, fetcher)
  const { data: allBills } = useSWR(user?.role === "manager" ? "/api/bills" : null, fetcher)
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [profileSaved, setProfileSaved] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState("")

  const myBills = bills ?? []
  const totalRevenue = myBills.reduce((s: number, b: { total: number }) => s + Number(b.total), 0)
  const managerBills = allBills ?? []
  const managerRevenue = managerBills.reduce((s: number, b: { total: number }) => s + Number(b.total), 0)

  function saveProfile() {
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  async function changePassword() {
    if (newPassword !== confirmPassword) return
    if (!newPassword || newPassword.length < 6) { setPwError("Password must be at least 6 characters"); return }
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { setPwError(error.message); return }
    setPwSaved(true)
    setNewPassword("")
    setConfirmPassword("")
    setPwError("")
    setTimeout(() => setPwSaved(false), 3000)
  }

  const initials = (user?.name || "U").split(" ").map((n) => n[0]).join("").toUpperCase()

  return (
    <div className="flex flex-col gap-6">
      <div><h1 className="text-2xl font-bold tracking-tight">My Profile</h1><p className="text-muted-foreground">View and update your account details</p></div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:row-span-2">
          <CardContent className="flex flex-col items-center gap-4 pt-8">
            <Avatar className="h-20 w-20"><AvatarFallback className="bg-primary text-primary-foreground text-2xl">{initials}</AvatarFallback></Avatar>
            <div className="text-center">
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge className="mt-2" variant="secondary"><Shield className="mr-1 h-3 w-3" />{user?.role === "manager" ? "Manager" : "Biller"}</Badge>
            </div>
            <Separator className="my-2" />
            {user?.role === "biller" && (
              <div className="w-full flex flex-col gap-3">
                <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground flex items-center gap-1"><Receipt className="h-3 w-3" />Bills Created</span><span className="font-semibold">{myBills.length}</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground flex items-center gap-1"><IndianRupee className="h-3 w-3" />Revenue</span><span className="font-semibold">Rs.{totalRevenue.toFixed(2)}</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Avg Bill</span><span className="font-semibold">Rs.{myBills.length > 0 ? (totalRevenue / myBills.length).toFixed(2) : "0.00"}</span></div>
              </div>
            )}
            {user?.role === "manager" && (
              <div className="w-full flex flex-col gap-3">
                <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Total Bills</span><span className="font-semibold">{managerBills.length}</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Total Revenue</span><span className="font-semibold">Rs.{managerRevenue.toFixed(2)}</span></div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><User className="h-4 w-4" />Edit Profile</CardTitle><CardDescription>Update your name and email address</CardDescription></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5"><Label htmlFor="name">Full Name</Label><Input id="name" value={name} onChange={(e) => { setName(e.target.value); setProfileSaved(false) }} /></div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="email">Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input id="email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setProfileSaved(false) }} className="pl-9" /></div></div>
            <Button onClick={saveProfile} className="w-fit"><Save className="mr-2 h-4 w-4" />{profileSaved ? "Saved!" : "Save Changes"}</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Lock className="h-4 w-4" />Change Password</CardTitle><CardDescription>Update your account password</CardDescription></CardHeader>
          <CardContent className="flex flex-col gap-4">
            {pwError && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{pwError}</div>}
            <div className="flex flex-col gap-1.5"><Label htmlFor="newPw">New Password</Label><Input id="newPw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="confirmPw">Confirm New Password</Label><Input id="confirmPw" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />{confirmPassword && newPassword !== confirmPassword && <p className="text-xs text-red-500">Passwords do not match</p>}</div>
            <Button onClick={changePassword} className="w-fit" disabled={!newPassword || newPassword !== confirmPassword}><Lock className="mr-2 h-4 w-4" />{pwSaved ? "Updated!" : "Change Password"}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
