import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/contexts/auth-context"
import { getSession } from "@/lib/auth"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CastPro - Supply Chain Management",
  description: "Supply Chain Demand Forecasting & Billing System",
}

export const viewport: Viewport = {
  themeColor: "#1E40AF",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession()
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider initialUser={user}>{children}</AuthProvider>
      </body>
    </html>
  )
}
