"use client"

import { useSettings } from "@/contexts/SettingsContext"

interface TurnIndicatorProps {
  phase: string
  turnNumber: number
  aiName: string
  aiRemainingCount: number
  winner: string | null
}

export function TurnIndicator({ phase, turnNumber, aiName, aiRemainingCount, winner }: TurnIndicatorProps) {
  const { t } = useSettings()

  if (phase === "game_over" && winner) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 border border-primary">
        <span className="text-lg font-bold text-primary">{t("soloGameOver")}</span>
        <span className="text-sm text-muted-foreground">
          {t("soloWinner")}: {winner}
        </span>
      </div>
    )
  }

  const isAiTurn = phase === "ai_turn"

  return (
    <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-muted/50 border border-border">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">
          {t("soloTurn")} {turnNumber}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${isAiTurn ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
          {isAiTurn ? `${aiName}` : t("soloYourTurn")}
        </span>
      </div>
      <span className="text-xs text-muted-foreground">
        {t("soloAiCandidates")}: {aiRemainingCount}
      </span>
    </div>
  )
}
