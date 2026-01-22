import { NextResponse } from "next/server"
import { getRoom } from "@/lib/kv"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const room = await getRoom(code)

    if (!room) {
      return NextResponse.json(
        { success: false, error: "Room not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      room: {
        players: room.players,
        seed: room.seed,
        started: room.started,
      },
    })
  } catch (error) {
    console.error("Error fetching room:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch room" },
      { status: 500 }
    )
  }
}
