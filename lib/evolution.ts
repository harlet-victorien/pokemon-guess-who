export function getGeneration(id: number): number {
  if (id <= 151) return 1
  if (id <= 251) return 2
  if (id <= 386) return 3
  if (id <= 493) return 4
  if (id <= 649) return 5
  return 0
}

interface SpeciesResponse {
  evolves_from_species: { name: string; url: string } | null
}

export async function getEvolutionStage(id: number): Promise<number> {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
    if (!response.ok) return 1
    
    const data: SpeciesResponse = await response.json()
    
    // If no evolution, it's a basic Pokemon (stage 1)
    if (!data.evolves_from_species) return 1
    
    // Check the pre-evolution's species
    const preEvoResponse = await fetch(data.evolves_from_species.url)
    if (!preEvoResponse.ok) return 2
    
    const preEvoData: SpeciesResponse = await preEvoResponse.json()
    
    // If pre-evolution has no evolution, this is stage 2
    if (!preEvoData.evolves_from_species) return 2
    
    // Otherwise, this is stage 3
    return 3
  } catch {
    return 1
  }
}
