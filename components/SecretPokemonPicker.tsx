"use client"

import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/contexts/SettingsContext"
import type { Pokemon } from "@/types"

interface SecretPokemonPickerProps {
  pokemon: Pokemon[]
  onPick: (pokemonId: number) => void
  loading: boolean
}

export function SecretPokemonPicker({ pokemon, onPick, loading }: SecretPokemonPickerProps) {
  const { t, language, gridLayout } = useSettings()
  const [selectedId, setSelectedId] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="text-center">
        <h2 className="text-xl font-bold">{t("soloPickSecret")}</h2>
        <p className="text-sm text-muted-foreground">{t("soloPickSecretDesc")}</p>
      </div>

      <div className={`grid gap-2 ${gridLayout === "8x5" ? "grid-cols-4 sm:grid-cols-5 md:grid-cols-8" : "grid-cols-4 sm:grid-cols-5"}`}>
        {pokemon.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelectedId(p.id)}
            className={`aspect-square w-full flex flex-col items-center justify-center rounded-lg shadow-sm border-2 bg-card transition-all duration-200 overflow-hidden ${
              selectedId === p.id
                ? "border-primary ring-2 ring-primary/50 scale-105"
                : "border-border hover:scale-105 hover:shadow-md"
            }`}
          >
            <div className="relative w-3/4 aspect-square">
              <Image
                src={p.sprite || "/placeholder.svg"}
                alt={p.names[language]}
                fill
                className="object-contain pixelated"
                unoptimized
              />
            </div>
            <span className="text-xs font-medium capitalize mt-1 truncate w-full px-1 text-center">
              {p.names[language]}
            </span>
            <span className="text-[10px] text-muted-foreground">#{p.id}</span>
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={() => selectedId && onPick(selectedId)}
          disabled={!selectedId || loading}
          size="lg"
        >
          {loading ? t("soloConfirming") : t("soloConfirmSecret")}
        </Button>
      </div>
    </div>
  )
}
