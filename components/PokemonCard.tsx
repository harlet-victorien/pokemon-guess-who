"use client"

import Image from "next/image"
import { TypeIcon } from "@/components/TypeIcon"

interface PokemonCardProps {
  id: number
  name: string
  sprite: string
  types: string[]
  generation: number
  evolutionStage: number
  flipped: boolean
  onFlip: () => void
}

const stageLabels: Record<number, string> = {
  1: "Basic",
  2: "Stage 1",
  3: "Stage 2",
}

export function PokemonCard({ 
  id, 
  name, 
  sprite, 
  types, 
  generation, 
  evolutionStage, 
  flipped, 
  onFlip 
}: PokemonCardProps) {
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
        aria-label={`${name}${flipped ? " (eliminated)" : ""}`}
      >
        {/* Type icons - top right */}
        <div className="absolute top-1 right-1 flex flex-col gap-0.5 z-20">
          {types.map((type) => (
            <TypeIcon key={type} type={type} size={14} showTooltip={false} />
          ))}
        </div>

        {flipped && (
          <div className="absolute inset-0 bg-black/50 z-10" />
        )}
        
        <div className="relative w-3/4 aspect-square z-0">
          <Image
            src={sprite || "/placeholder.svg"}
            alt={name}
            fill
            className={`object-contain pixelated ${flipped ? "grayscale" : ""}`}
            unoptimized
          />
        </div>
        
        <span className={`text-xs font-medium capitalize mt-1 truncate w-full px-1 text-center z-0 ${flipped ? "text-muted-foreground" : "text-foreground"}`}>
          {name}
        </span>
        <span className={`text-[10px] z-0 ${flipped ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
          #{id}
        </span>
      </button>

      {/* Info tooltip - shows on hover, positioned outside the card */}
      {!flipped && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 bg-foreground text-background text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {types.map((type) => (
              <TypeIcon key={type} type={type} size={14} showTooltip={false} />
            ))}
            <span className="capitalize">{types.join(" / ")}</span>
          </div>
          <span>Gen {generation} - {stageLabels[evolutionStage] || "Basic"}</span>
        </div>
      )}
    </div>
  )
}
