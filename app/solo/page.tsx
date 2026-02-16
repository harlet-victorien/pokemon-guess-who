"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsMenu } from "@/components/SettingsMenu"
import { useSettings } from "@/contexts/SettingsContext"
import { generatePokemonIds } from "@/lib/rng"
import { fetchAllPokemon } from "@/lib/pokemon"

export default function SoloPage() {
  const router = useRouter()
  const { t } = useSettings()
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (name.length < 1 || name.length > 20) {
      setError(t("nameError"))
      return
    }

    setLoading(true)

    try {
      const seed = Date.now()
      const ids = generatePokemonIds(seed, 40)
      const pokemonData = await fetchAllPokemon(ids)

      if (pokemonData.length < 40) {
        setError(t("partialLoad").replace("{count}", String(pokemonData.length)))
        setLoading(false)
        return
      }

      // Send to Python API via proxy
      const response = await fetch("/api/solo/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_name: name,
          seed,
          pokemon_list: pokemonData.map((p) => ({
            id: p.id,
            name: p.name,
            types: p.types,
            generation: p.generation,
            evolution_stage: p.evolutionStage,
          })),
        }),
      })

      const data = await response.json()

      if (!data.session_id) {
        setError(t("connectionError"))
        return
      }

      // Store data in sessionStorage for the game page
      sessionStorage.setItem("soloPlayerName", name)
      sessionStorage.setItem("soloSeed", String(seed))
      sessionStorage.setItem("soloAiName", data.ai_name)
      sessionStorage.setItem("soloPokemon", JSON.stringify(pokemonData))

      router.push(`/solo/${data.session_id}`)
    } catch {
      setError(t("connectionError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-secondary/30 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <SettingsMenu />
      </div>
      <div className="flex flex-col items-center gap-8 w-full max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">{t("title")}</h1>
          <p className="text-muted-foreground">{t("soloSubtitle")}</p>
        </div>

        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t("soloStart")}</CardTitle>
            <CardDescription>{t("soloStartDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStart} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  {t("yourName")}
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t("enterName")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={20}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? t("soloLoading") : t("soloPlay")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Button variant="ghost" asChild>
          <Link href="/">{t("backToHome")}</Link>
        </Button>
      </div>
    </main>
  )
}
