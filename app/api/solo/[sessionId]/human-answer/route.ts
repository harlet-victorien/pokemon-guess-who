import { NextRequest, NextResponse } from "next/server"

const PYTHON_API = process.env.PYTHON_API_URL || "http://localhost:8000"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const body = await req.json()
  const res = await fetch(`${PYTHON_API}/game/${sessionId}/human-answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
