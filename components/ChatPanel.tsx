"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSettings } from "@/contexts/SettingsContext"

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
}: ChatPanelProps) {
  const { t } = useSettings()
  const [question, setQuestion] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return
    onAskQuestion(question.trim())
    setQuestion("")
  }

  return (
    <div className="flex flex-col h-full border border-border rounded-lg bg-card">
      <div className="px-4 py-2 border-b border-border">
        <h3 className="text-sm font-medium">{t("soloChat")}</h3>
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

        {/* Human turn — question input */}
        {phase === "human_turn" && (
          <>
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
            <Button onClick={onEndTurn} variant="ghost" size="sm" className="w-full text-xs">
              {t("soloEndTurn")}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
