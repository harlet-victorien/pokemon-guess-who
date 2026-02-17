"use client"

import Image from "next/image"
import type { Language } from "@/lib/translations"
import { TypeIcon } from "@/components/TypeIcon"
import { useSettings } from "@/contexts/SettingsContext"

interface PokemonCardProps {
  id: number
  names: Record<Language, string>
  sprite: string
  types: string[]
  generation: number
  evolutionStage: number
  flipped: boolean
  onFlip: () => void
}

export function PokemonCard({
  id,
  names,
  sprite,
  types,
  generation,
  evolutionStage,
  flipped,
  onFlip
}: PokemonCardProps) {
  const { t, language } = useSettings()
  const displayName = names[language]

  const getEvolutionStageName = (stage: number): string => {
    switch (stage) {
      case 1:
        return t("basic")
      case 2:
        return t("stage1")
      case 3:
        return t("stage2")
      default:
        return t("basic")
    }
  }

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onFlip}
        className={`
          aspect-square w-full flex flex-col items-center justify-center
          rounded-lg shadow-sm border border-border bg-card
          transition-all duration-200 ease-out relative overflow-hidden
          ${flipped 
            ? "cursor-default" 
            : "hover:scale-105 hover:shadow-md cursor-pointer"
          }
        `}
        aria-label={`${displayName}${flipped ? " (eliminated)" : ""}`}
      >
        <div className="absolute top-1 right-1 flex flex-col gap-0.5 z-20">
          {types.map((type) => (
            <TypeIcon key={type} type={type} size={14} showTooltip={false} />
          ))}
        </div>

        {flipped && (
          <div className="absolute inset-0 bg-black/50 z-10" />
        )}
        
        <div className="relative w-3/5 aspect-square z-0 flex-shrink-0">
          <Image
            src={sprite || "/placeholder.svg"}
            alt={displayName}
            fill
            className={`object-contain pixelated ${flipped ? "grayscale" : ""}`}
            unoptimized
          />
        </div>

        <span className={`text-[10px] sm:text-xs font-medium capitalize mt-0.5 truncate w-full px-0.5 text-center z-0 leading-tight ${flipped ? "text-muted-foreground" : "text-foreground"}`}>
          {displayName}
        </span>
        <span className={`text-[9px] sm:text-[10px] z-0 ${flipped ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
          #{id}
        </span>
      </button>

      {!flipped && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 bg-foreground text-background text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {types.map((type) => (
              <TypeIcon key={type} type={type} size={14} showTooltip={false} />
            ))}
            <span className="capitalize">{types.join(" / ")}</span>
          </div>
          <span>{t("generation")} {generation} - {getEvolutionStageName(evolutionStage)}</span>
        </div>
      )}
    </div>
  )
}
