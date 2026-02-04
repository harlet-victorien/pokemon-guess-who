import { NextResponse } from "next/server"
import { getRoom, setRoom } from "@/lib/kv"
import type { Room } from "@/types"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== "string" || name.length < 1 || name.length > 20) {
      return NextResponse.json(
        { success: false, error: "Name must be 1-20 characters" },
        { status: 400 }
      )
    }

    let room = await getRoom(code)

    if (!room) {
      // Create new room
      room = {
        players: [name],
        maxPlayers: 4,
        seed: null,
        started: false,
        createdAt: Date.now(),
      }
      await setRoom(code, room)
      return NextResponse.json({ success: true, room })
    }

    if (room.players.length >= room.maxPlayers) {
      return NextResponse.json(
        { success: false, error: "Room is full" },
        { status: 400 }
      )
    }

    // Check if player is already in room
    if (room.players.includes(name)) {
      return NextResponse.json({ success: true, room })
    }

    // Add player to room
    const updatedRoom: Room = {
      ...room,
      players: [...room.players, name],
    }
    await setRoom(code, updatedRoom)

    return NextResponse.json({ success: true, room: updatedRoom })
  } catch (error) {
    console.error("Error joining room:", error)
    return NextResponse.json(
      { success: false, error: "Failed to join room" },
      { status: 500 }
    )
  }
}
