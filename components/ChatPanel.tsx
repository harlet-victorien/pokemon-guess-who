"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { EyeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useSettings } from "@/contexts/SettingsContext"
import type { Pokemon } from "@/types"

interface ChatMessage {
  role: string
  content: string
}

interface ChatPanelProps {
  messages: ChatMessage[]
  phase: string
  aiName: string
  onAnswer: (answer: "yes" | "no") => void
  onAskQuestion: (question: string) => void
  onEndTurn: () => void
  answering: boolean
  asking: boolean
  pendingAiQuestion: boolean
  humanAskedThisTurn: boolean
  aiThinking: boolean
  aiProcessing: boolean
  pokemon: Pokemon[]
  aiCandidates: Set<number>
}

export function ChatPanel({
  messages,
  phase,
  aiName,
  onAnswer,
  onAskQuestion,
  onEndTurn,
  answering,
  asking,
  pendingAiQuestion,
  humanAskedThisTurn,
  aiThinking,
  aiProcessing,
  pokemon,
  aiCandidates,
}: ChatPanelProps) {
  const { t, language } = useSettings()
  const [question, setQuestion] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, aiThinking, aiProcessing])

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return
    onAskQuestion(question.trim())
    setQuestion("")
  }

  return (
    <div className="flex flex-col h-full border border-border rounded-lg bg-card">
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-medium">{t("soloChat")}</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
              <EyeIcon className="size-3.5" />
              {t("soloAiBoard")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{aiName} — {t("soloAiBoard")} ({aiCandidates.size}/{pokemon.length})</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 mt-4">
              {pokemon.map((p) => {
                const eliminated = !aiCandidates.has(p.id)
                return (
                  <div
                    key={p.id}
                    className={`flex flex-col items-center p-1 rounded-lg border border-border ${eliminated ? "opacity-30" : "bg-card"}`}
                  >
                    <div className="relative w-full aspect-square">
                      <Image
                        src={p.sprite || "/placeholder.svg"}
                        alt={p.names[language]}
                        fill
                        className={`object-contain pixelated ${eliminated ? "grayscale" : ""}`}
                        unoptimized
                      />
                    </div>
                    <span className="text-[9px] font-medium truncate w-full text-center mt-0.5">
                      {p.names[language]}
                    </span>
                  </div>
                )
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "human_question" || msg.role === "human_answer" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                msg.role === "human_question" || msg.role === "human_answer"
                  ? "bg-primary text-primary-foreground"
                  : msg.role === "system"
                    ? "bg-muted text-muted-foreground italic"
                    : "bg-muted text-foreground"
              }`}
            >
              {msg.role === "ai_question" && (
                <span className="text-xs font-medium text-muted-foreground block mb-1">{aiName}</span>
              )}
              {msg.role === "ai_answer" && (
                <span className="text-xs font-medium text-muted-foreground block mb-1">{aiName}</span>
              )}
              {msg.content}
            </div>
          </div>
        ))}

        {/* AI thinking indicator — shown inline in chat */}
        {aiThinking && (
          <div className="flex justify-start">
            <div className="max-w-[80%] px-3 py-2 rounded-lg text-sm bg-muted text-muted-foreground">
              <span className="text-xs font-medium block mb-1">{aiName}</span>
              <span className="flex items-center gap-2">
                <span className="size-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                {t("soloAiThinking")}
              </span>
            </div>
          </div>
        )}

        {/* AI processing answer indicator */}
        {aiProcessing && (
          <div className="flex justify-start">
            <div className="max-w-[80%] px-3 py-2 rounded-lg text-sm bg-muted text-muted-foreground">
              <span className="text-xs font-medium block mb-1">{aiName}</span>
              <span className="flex items-center gap-2">
                <span className="size-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                {t("soloAiProcessing")}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border space-y-2">
        {/* AI asked a question — show yes/no buttons */}
        {pendingAiQuestion && phase === "ai_turn" && (
          <div className="flex gap-2">
            <Button
              onClick={() => onAnswer("yes")}
              disabled={answering}
              className="flex-1"
              variant="outline"
            >
              {t("soloYes")}
            </Button>
            <Button
              onClick={() => onAnswer("no")}
              disabled={answering}
              className="flex-1"
              variant="outline"
            >
              {t("soloNo")}
            </Button>
          </div>
        )}

        {/* Human turn — ask (if hasn't asked yet) or end turn */}
        {phase === "human_turn" && !humanAskedThisTurn && (
          <form onSubmit={handleSubmitQuestion} className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t("soloAskPlaceholder")}
              disabled={asking}
            />
            <Button type="submit" disabled={asking || !question.trim()} size="sm">
              {t("soloAsk")}
            </Button>
          </form>
        )}

        {/* Human turn — end turn (always visible) */}
        {phase === "human_turn" && (
          <Button onClick={onEndTurn} variant="ghost" size="sm" className="w-full text-xs">
            {t("soloEndTurn")}
          </Button>
        )}
      </div>
    </div>
  )
}
