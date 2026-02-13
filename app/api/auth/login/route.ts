import { NextResponse } from "next/server"
import { authenticate, createSession } from "@/lib/auth"

export async function POST(req: Request) {
  const { email, password } = await req.json()
  const user = await authenticate(email, password)
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }
  await createSession(user)
  return NextResponse.json({ user })
}
