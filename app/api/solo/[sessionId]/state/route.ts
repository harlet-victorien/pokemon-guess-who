import { NextRequest, NextResponse } from "next/server"

const PYTHON_API = process.env.PYTHON_API_URL || "http://localhost:8000"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const res = await fetch(`${PYTHON_API}/game/${sessionId}/state`)
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
