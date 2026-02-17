"use client"

import { PokemonCard } from "@/components/PokemonCard"
import { TypeLegend } from "@/components/TypeLegend"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/contexts/SettingsContext"
import type { Pokemon } from "@/types"

interface SoloBoardProps {
  pokemon: Pokemon[]
  flippedIds: Set<number>
  onFlip: (id: number) => void
  humanSecretId: number | null
  phase: string
  onGuess: (pokemonId: number) => void
  guessing: boolean
  canGuess: boolean
}

export function SoloBoard({ pokemon, flippedIds, onFlip, humanSecretId, phase, onGuess, guessing, canGuess }: SoloBoardProps) {
  const { t, language, gridLayout } = useSettings()

  const isPlaying = phase === "human_turn" || phase === "ai_turn"

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t("soloYourSecret")}:</span>
          <span className="font-medium">
            {humanSecretId
              ? pokemon.find((p) => p.id === humanSecretId)?.names[language] || `#${humanSecretId}`
              : "—"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t("remaining")}:</span>
          <span className="font-medium">{pokemon.length - flippedIds.size}/{pokemon.length}</span>
        </div>
      </div>

      <div className={`grid gap-2 ${gridLayout === "8x5" ? "grid-cols-4 sm:grid-cols-5 md:grid-cols-8" : "grid-cols-4 sm:grid-cols-5"}`}>
        {pokemon.map((p) => (
          <div key={p.id} className="relative group/card">
            <PokemonCard
              id={p.id}
              names={p.names}
              sprite={p.sprite}
              types={p.types}
              generation={p.generation}
              evolutionStage={p.evolutionStage}
              flipped={flippedIds.has(p.id)}
              onFlip={() => onFlip(p.id)}
            />
            {isPlaying && phase === "human_turn" && canGuess && !flippedIds.has(p.id) && p.id !== humanSecretId && (
              <Button
                size="sm"
                variant="destructive"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 opacity-0 group-hover/card:opacity-100 transition-opacity text-[10px] px-2 py-0.5 h-auto z-30"
                onClick={(e) => {
                  e.stopPropagation()
                  onGuess(p.id)
                }}
                disabled={guessing}
              >
                {t("soloGuess")}
              </Button>
            )}
          </div>
        ))}
      </div>

      <TypeLegend />
      <p className="text-xs text-center text-muted-foreground">{t("eliminationHint")}</p>
    </div>
  )
}
