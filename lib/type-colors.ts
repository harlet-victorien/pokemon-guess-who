export const typeColors: Record<string, string> = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
}

export function getCardBackground(types: string[]): string {
  const c1 = typeColors[types[0]] || typeColors.normal
  if (types.length === 1) {
    return c1
  }
  const c2 = typeColors[types[1]] || typeColors.normal
  return `linear-gradient(135deg, ${c1} 50%, ${c2} 50%)`
}
