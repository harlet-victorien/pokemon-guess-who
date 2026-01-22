"use client"

import { useState, useEffect } from "react"
import { PokemonCard } from "@/components/PokemonCard"
import { TypeLegend } from "@/components/TypeLegend"
import { generatePokemonIds } from "@/lib/rng"
import { fetchAllPokemon } from "@/lib/pokemon"
import { useSettings } from "@/contexts/SettingsContext"
import { useLanguage } from "@/contexts/LanguageContext" // Import useLanguage from LanguageContext
import type { Pokemon } from "@/types"

interface BoardProps {
  seed: number
  players: string[]
}

export function Board({ seed, players }: BoardProps) {
  const { t, gridLayout } = useSettings() // Use the imported useLanguage
  const [pokemon, setPokemon] = useState<Pokemon[]>([])
  const [flippedIds, setFlippedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadPokemon() {
      try {
        const ids = generatePokemonIds(seed, 40)
        const pokemonData = await fetchAllPokemon(ids)
        
        if (pokemonData.length < 40) {
          setError(t("partialLoad").replace("{count}", String(pokemonData.length)))
        }
        
        setPokemon(pokemonData)
      } catch {
        setError(t("loadError"))
      } finally {
        setLoading(false)
      }
    }

    loadPokemon()
  }, [seed, t])

  const handleFlip = (id: number) => {
    setFlippedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground">{t("loadingPokemon")}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t("playing")}</span>
          <span className="font-medium">{players.join(" vs ")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t("remaining")}</span>
          <span className="font-medium">{pokemon.length - flippedIds.size}/{pokemon.length}</span>
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-amber-600 text-center">{error}</p>
      )}
      
      <div className={`grid gap-2 ${gridLayout === "8x5" ? "grid-cols-4 sm:grid-cols-5 md:grid-cols-8" : "grid-cols-4 sm:grid-cols-5"}`}>
        {pokemon.map((p) => (
          <PokemonCard
            key={p.id}
            id={p.id}
            name={p.name}
            sprite={p.sprite}
            types={p.types}
            generation={p.generation}
            evolutionStage={p.evolutionStage}
            flipped={flippedIds.has(p.id)}
            onFlip={() => handleFlip(p.id)}
          />
        ))}
      </div>
      
      <TypeLegend />
      
      <p className="text-xs text-center text-muted-foreground">
        {t("eliminationHint")}
      </p>
    </div>
  )
}
