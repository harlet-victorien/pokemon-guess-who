import { NextResponse } from "next/server"
import { getRoom, setRoom } from "@/lib/kv"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const body = await request.json()
    const { name } = body

    const room = await getRoom(code)

    if (!room) {
      return NextResponse.json(
        { success: false, error: "Room not found" },
        { status: 404 }
      )
    }

    if (room.started) {
      return NextResponse.json(
        { success: false, error: "Game already started" },
        { status: 400 }
      )
    }

    // Only room creator (first player) can start
    if (room.players[0] !== name) {
      return NextResponse.json(
        { success: false, error: "Only room creator can start the game" },
        { status: 403 }
      )
    }

    // Require at least 2 players
    if (room.players.length < 2) {
      return NextResponse.json(
        { success: false, error: "Need at least 2 players to start" },
        { status: 400 }
      )
    }

    // Start the game
    const updatedRoom = {
      ...room,
      seed: Date.now(),
      started: true,
    }
    await setRoom(code, updatedRoom)

    return NextResponse.json({ success: true, room: updatedRoom })
  } catch (error) {
    console.error("Error starting game:", error)
    return NextResponse.json(
      { success: false, error: "Failed to start game" },
      { status: 500 }
    )
  }
}
