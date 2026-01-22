// Linear Congruential Generator for seeded random numbers
export function seededRandom(seed: number): () => number {
  let state = seed
  return () => {
    // LCG parameters (same as glibc)
    state = (state * 1103515245 + 12345) & 0x7fffffff
    return state / 0x7fffffff
  }
}

export function generatePokemonIds(seed: number, count: number = 40): number[] {
  const rng = seededRandom(seed)
  const ids = new Set<number>()
  
  // Pokemon IDs from Gen 1-5 (1-649)
  const MIN_ID = 1
  const MAX_ID = 649
  
  while (ids.size < count) {
    const id = Math.floor(rng() * (MAX_ID - MIN_ID + 1)) + MIN_ID
    ids.add(id)
  }
  
  return Array.from(ids)
}
