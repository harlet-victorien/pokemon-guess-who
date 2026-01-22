import type { Pokemon } from "@/types"
import { getGeneration, getEvolutionStage } from "@/lib/evolution"

interface PokeAPIResponse {
  id: number
  name: string
  sprites: {
    front_default: string | null
  }
  types: Array<{
    type: {
      name: string
    }
  }>
}

export async function fetchPokemon(id: number, retries: number = 1): Promise<Pokemon | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const [pokemonResponse, evolutionStage] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
        getEvolutionStage(id),
      ])
      
      if (!pokemonResponse.ok) continue
      
      const data: PokeAPIResponse = await pokemonResponse.json()
      return {
        id: data.id,
        name: data.name,
        sprite: data.sprites.front_default || `/placeholder.svg?text=${data.name}`,
        types: data.types.map((t) => t.type.name),
        generation: getGeneration(data.id),
        evolutionStage,
      }
    } catch {
      if (attempt === retries) return null
    }
  }
  return null
}

export async function fetchAllPokemon(ids: number[]): Promise<Pokemon[]> {
  const results = await Promise.all(ids.map((id) => fetchPokemon(id)))
  return results.filter((p): p is Pokemon => p !== null)
}
