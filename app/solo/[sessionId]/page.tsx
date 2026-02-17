"use client"

import { useState, useEffect, useCallback, use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsMenu } from "@/components/SettingsMenu"
import { SecretPokemonPicker } from "@/components/SecretPokemonPicker"
import { SoloBoard } from "@/components/SoloBoard"
import { ChatPanel } from "@/components/ChatPanel"
import { TurnIndicator } from "@/components/TurnIndicator"
import { useSettings } from "@/contexts/SettingsContext"
import type { Pokemon } from "@/types"

interface SoloGamePageProps {
  params: Promise<{ sessionId: string }>
}

type SoloPhase = "loading" | "picking_secret" | "ai_turn" | "human_turn" | "game_over" | "error"

interface ChatMessage {
  role: string
  content: string
}

export default function SoloGamePage({ params }: SoloGamePageProps) {
  const { sessionId } = use(params)
  const { t } = useSettings()

  const [phase, setPhase] = useState<SoloPhase>("loading")
  const [pokemon, setPokemon] = useState<Pokemon[]>([])
  const [aiName, setAiName] = useState("")
  const [turnNumber, setTurnNumber] = useState(0)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [aiRemainingCount, setAiRemainingCount] = useState(40)
  const [winner, setWinner] = useState<string | null>(null)
  const [aiSecretId, setAiSecretId] = useState<number | null>(null)
  const [humanSecretId, setHumanSecretId] = useState<number | null>(null)
  const [flippedIds, setFlippedIds] = useState<Set<number>>(new Set())
  const [aiCandidates, setAiCandidates] = useState<Set<number>>(new Set())
  const [error, setError] = useState("")

  const [pickingLoading, setPickingLoading] = useState(false)
  const [aiTurnLoading, setAiTurnLoading] = useState(false)
  const [answering, setAnswering] = useState(false)
  const [asking, setAsking] = useState(false)
  const [guessing, setGuessing] = useState(false)
  const [pendingAiQuestion, setPendingAiQuestion] = useState(false)
  const [humanAskedThisTurn, setHumanAskedThisTurn] = useState(false)

  // Load pokemon from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("soloPokemon")
    const storedAiName = sessionStorage.getItem("soloAiName")

    if (!stored) {
      setError("Session data not found. Please start a new game.")
      setPhase("error")
      return
    }

    setPokemon(JSON.parse(stored))
    setAiName(storedAiName || "AI")
    setPhase("picking_secret")
  }, [])

  // Sync state from server
  const refreshState = useCallback(async () => {
    try {
      const res = await fetch(`/api/solo/${sessionId}/state`)
      const data = await res.json()
      setPhase(data.phase)
      setTurnNumber(data.turn_number)
      setAiRemainingCount(data.ai_remaining_count)
      if (data.ai_candidates) setAiCandidates(new Set(data.ai_candidates))
      setChatHistory(data.chat_history || [])
      if (data.winner) setWinner(data.winner)
      if (data.ai_secret_id) setAiSecretId(data.ai_secret_id)
    } catch {
      // silent
    }
  }, [sessionId])

  // Trigger AI turn — called explicitly, never from useEffect
  const triggerAiTurn = useCallback(async () => {
    setAiTurnLoading(true)
    setPhase("ai_turn")
    setHumanAskedThisTurn(false)
    try {
      const res = await fetch(`/api/solo/${sessionId}/ai-turn`, { method: "POST" })
      const data = await res.json()
      setChatHistory(data.chat_history || [])
      if (data.ai_candidates) setAiCandidates(new Set(data.ai_candidates))

      if (data.action === "guess") {
        if (data.guess_correct) {
          setWinner(aiName)
          setPhase("game_over")
          await refreshState()
        } else {
          // AI guessed wrong: cross out that pokemon, continue to human turn
          if (data.guess_id) {
            setFlippedIds((prev) => new Set(prev).add(data.guess_id))
          }
          await refreshState()
        }
      } else if (data.action === "question") {
        setPendingAiQuestion(true)
        await refreshState()
      }
    } catch {
      setError("AI turn failed")
    } finally {
      setAiTurnLoading(false)
    }
  }, [sessionId, aiName, refreshState])

  // Pick secret pokemon → then trigger first AI turn
  const handlePickSecret = useCallback(async (pokemonId: number) => {
    setPickingLoading(true)
    try {
      const res = await fetch(`/api/solo/${sessionId}/set-human-secret`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pokemon_id: pokemonId }),
      })
      const data = await res.json()
      if (data.success) {
        setHumanSecretId(pokemonId)
        setPickingLoading(false)
        // Trigger first AI turn
        await triggerAiTurn()
      }
    } catch {
      setError("Failed to set secret Pokemon")
      setPickingLoading(false)
    }
  }, [sessionId, triggerAiTurn])

  // Answer AI's question
  const handleAnswer = useCallback(async (answer: "yes" | "no") => {
    setAnswering(true)
    try {
      const res = await fetch(`/api/solo/${sessionId}/human-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      })
      const data = await res.json()
      setChatHistory(data.chat_history || [])
      setAiRemainingCount(data.ai_remaining_count)
      if (data.ai_candidates) setAiCandidates(new Set(data.ai_candidates))
      setPendingAiQuestion(false)
      setHumanAskedThisTurn(false)
      // Server sets phase to human_turn after elimination
      await refreshState()
    } catch {
      setError("Failed to send answer")
    } finally {
      setAnswering(false)
    }
  }, [sessionId, refreshState])

  // Ask a question (human turn) — one question per turn
  const handleAskQuestion = useCallback(async (question: string) => {
    setAsking(true)
    try {
      const res = await fetch(`/api/solo/${sessionId}/human-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      })
      const data = await res.json()
      setChatHistory(data.chat_history || [])
      setHumanAskedThisTurn(true)
    } catch {
      setError("Failed to ask question")
    } finally {
      setAsking(false)
    }
  }, [sessionId])

  // End human turn → tell server → trigger AI turn
  const handleEndTurn = useCallback(async () => {
    try {
      await fetch(`/api/solo/${sessionId}/end-turn`, { method: "POST" })
      await triggerAiTurn()
    } catch {
      setError("Failed to end turn")
    }
  }, [sessionId, triggerAiTurn])

  // Guess AI's pokemon (human turn) — ends the turn on wrong guess
  const handleGuess = useCallback(async (pokemonId: number) => {
    setGuessing(true)
    try {
      const res = await fetch(`/api/solo/${sessionId}/human-guess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pokemon_id: pokemonId }),
      })
      const data = await res.json()
      setChatHistory(data.chat_history || [])

      if (data.correct) {
        setAiSecretId(data.ai_secret_id)
        setWinner(sessionStorage.getItem("soloPlayerName") || "You")
        setPhase("game_over")
      } else {
        // Wrong guess: cross out the pokemon, lock guessing for rest of turn
        setFlippedIds((prev) => new Set(prev).add(pokemonId))
        setHumanAskedThisTurn(true)
      }
    } catch {
      setError("Failed to guess")
    } finally {
      setGuessing(false)
    }
  }, [sessionId])

  const handleFlip = (id: number) => {
    setFlippedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (phase === "loading") {
    return (
      <main className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">{t("loadingPokemon")}</p>
        </div>
      </main>
    )
  }

  if (phase === "error") {
    return (
      <main className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">{t("error")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground text-center">{error}</p>
            <Button asChild>
              <Link href="/solo">{t("backToHome")}</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (phase === "picking_secret") {
    return (
      <main className="min-h-screen bg-secondary/30 flex flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
            <SettingsMenu />
          </div>
          <SecretPokemonPicker
            pokemon={pokemon}
            onPick={handlePickSecret}
            loading={pickingLoading}
          />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-secondary/30 flex flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-7xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <div className="flex items-center gap-2">
            <SettingsMenu />
            <Button variant="outline" asChild>
              <Link href="/solo">{t("leaveGame")}</Link>
            </Button>
          </div>
        </div>

        <TurnIndicator
          phase={phase}
          turnNumber={turnNumber}
          aiName={aiName}
          aiRemainingCount={aiRemainingCount}
          winner={winner}
        />

        <div className="mt-4 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 min-w-0">
            <SoloBoard
              pokemon={pokemon}
              flippedIds={flippedIds}
              onFlip={handleFlip}
              humanSecretId={humanSecretId}
              phase={phase}
              onGuess={handleGuess}
              guessing={guessing}
              canGuess={!humanAskedThisTurn}
            />
          </div>
          <div className="lg:w-80 h-[400px] lg:h-[600px]">
            <ChatPanel
              messages={chatHistory}
              phase={phase}
              aiName={aiName}
              onAnswer={handleAnswer}
              onAskQuestion={handleAskQuestion}
              onEndTurn={handleEndTurn}
              answering={answering}
              asking={asking}
              pendingAiQuestion={pendingAiQuestion}
              humanAskedThisTurn={humanAskedThisTurn}
              aiThinking={aiTurnLoading}
              aiProcessing={answering}
              pokemon={pokemon}
              aiCandidates={aiCandidates}
            />
          </div>
        </div>

        {phase === "game_over" && aiSecretId && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {t("soloAiSecret")}: {pokemon.find((p) => p.id === aiSecretId)?.name || `#${aiSecretId}`}
          </div>
        )}
      </div>
    </main>
  )
}
