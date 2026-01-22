"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSettings } from "@/contexts/SettingsContext"

interface LobbyProps {
  players: string[]
  roomCode: string
}

export function Lobby({ players, roomCode }: LobbyProps) {
  const { t } = useSettings()

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
          <span className="text-sm text-muted-foreground">{t("players")}</span>
          <div className="flex flex-col gap-2 w-full">
            {players.map((player, index) => (
              <div
                key={index}
                className="flex items-center justify-center gap-2 rounded-lg bg-secondary p-3"
              >
                <div className="size-2 rounded-full bg-green-500" />
                <span className="font-medium">{player}</span>
              </div>
            ))}
            {players.length < 2 && (
              <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 p-3">
                <div className="size-2 rounded-full bg-muted-foreground/30 animate-pulse" />
                <span className="text-muted-foreground">{t("waiting")}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm text-muted-foreground">
            {t("waitingForPlayer")}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
