"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Lobby } from "@/components/Lobby"
import { Board } from "@/components/Board"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Room } from "@/types"

interface GamePageProps {
  params: Promise<{ code: string }>
}

type GameState = "loading" | "lobby" | "playing" | "error"

export default function GamePage({ params }: GamePageProps) {
  const { code } = use(params)
  const [gameState, setGameState] = useState<GameState>("loading")
  const [room, setRoom] = useState<Room | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null

    async function fetchRoom() {
      try {
        const response = await fetch(`/api/room/${code}`)
        const data = await response.json()

        if (!data.success) {
          setError(data.error || "Room not found")
          setGameState("error")
          return
        }

        setRoom(data.room)

        if (data.room.started) {
          setGameState("playing")
          if (pollInterval) clearInterval(pollInterval)
        } else {
          setGameState("lobby")
        }
      } catch {
        setError("Failed to connect to server")
        setGameState("error")
      }
    }

    fetchRoom()

    // Poll every 2 seconds until game starts
    pollInterval = setInterval(fetchRoom, 2000)

    return () => {
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [code])

  if (gameState === "loading") {
    return (
      <main className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Loading room...</p>
        </div>
      </main>
    )
  }

  if (gameState === "error") {
    return (
      <main className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground text-center">{error}</p>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (gameState === "lobby" && room) {
    return (
      <main className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
        <Lobby players={room.players} roomCode={code} />
      </main>
    )
  }

  if (gameState === "playing" && room && room.seed) {
    return (
      <main className="min-h-screen bg-secondary/30 flex flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">Pokemon Guess Who</h1>
            <Button variant="outline" asChild>
              <Link href="/">Leave Game</Link>
            </Button>
          </div>
          <Board seed={room.seed} players={room.players} />
        </div>
      </main>
    )
  }

  return null
}
