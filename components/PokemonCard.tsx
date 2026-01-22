"use client"

import Image from "next/image"
import { getCardBackground } from "@/lib/type-colors"
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
  const background = getCardBackground(types)

  return (
    <button
      type="button"
      onClick={onFlip}
      style={{ background }}
      className={`
        aspect-square flex flex-col items-center justify-center
        rounded-lg shadow-sm border border-black/10
        transition-all duration-200 ease-out relative overflow-hidden group
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
          <TypeIcon key={type} type={type} size={14} />
        ))}
      </div>

      {/* Info tooltip - shows on hover */}
      {!flipped && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1.5 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 flex flex-col gap-0.5">
          <span>Gen {generation}</span>
          <span>{stageLabels[evolutionStage] || "Basic"}</span>
        </div>
      )}

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
      
      <span className={`text-xs font-medium capitalize mt-1 truncate w-full px-1 text-center z-0 ${flipped ? "text-white/70" : "text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"}`}>
        {name}
      </span>
      <span className={`text-[10px] z-0 ${flipped ? "text-white/50" : "text-white/80 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"}`}>
        #{id}
      </span>
    </button>
  )
}
