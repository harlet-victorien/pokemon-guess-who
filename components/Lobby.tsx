"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/contexts/SettingsContext"

interface LobbyProps {
  players: string[]
  roomCode: string
  maxPlayers: number
  currentPlayerName: string
}

export function Lobby({ players, roomCode, maxPlayers, currentPlayerName }: LobbyProps) {
  const { t } = useSettings()
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState("")

  const isCreator = players[0] === currentPlayerName
  const canStart = players.length >= 2

  const handleStart = async () => {
    setStarting(true)
    setError("")

    try {
      const response = await fetch(`/api/room/${roomCode}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: currentPlayerName }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || "Failed to start game")
      }
    } catch {
      setError("Connection error")
    } finally {
      setStarting(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t("waitingForOpponent")}</CardTitle>
        <CardDescription>
          {t("shareCode")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-muted-foreground">{t("roomCode")}</span>
          <span className="text-3xl font-bold tracking-wider text-primary">
            {roomCode.toUpperCase()}
          </span>
        </div>
        
        <div className="flex flex-col items-center gap-2 w-full">
          <span className="text-sm text-muted-foreground">
            {t("players")} ({players.length}/{maxPlayers})
          </span>
          <div className="flex flex-col gap-2 w-full">
            {players.map((player, index) => (
              <div
                key={index}
                className="flex items-center justify-center gap-2 rounded-lg bg-secondary p-3"
              >
                <div className="size-2 rounded-full bg-green-500" />
                <span className="font-medium">
                  {player} {index === 0 && "(Host)"}
                </span>
              </div>
            ))}
            {Array.from({ length: maxPlayers - players.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 p-3"
              >
                <div className="size-2 rounded-full bg-muted-foreground/30 animate-pulse" />
                <span className="text-muted-foreground">{t("waiting")}</span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        {isCreator ? (
          <Button
            onClick={handleStart}
            disabled={!canStart || starting}
            className="w-full"
          >
            {starting ? t("starting") : t("startGame")}
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">
              {t("waitingForHost")}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
