import { typeColors } from "@/lib/type-colors"

interface TypeIconProps {
  type: string
  size?: number
  showTooltip?: boolean
}

const typeSymbols: Record<string, string> = {
  normal: "M12 2L2 12l10 10 10-10L12 2z",
  fire: "M12 2c0 6-4 8-4 12 0 2.2 1.8 4 4 4s4-1.8 4-4c0-4-4-6-4-12z",
  water: "M12 2c-4 4-6 7-6 11 0 3.3 2.7 6 6 6s6-2.7 6-6c0-4-2-7-6-11z",
  electric: "M13 2L4 14h6l-1 8 9-12h-6l1-8z",
  grass: "M12 2C8 2 5 5 5 9c0 2.4 1.2 4.5 3 5.7V22h8v-7.3c1.8-1.2 3-3.3 3-5.7 0-4-3-7-7-7z",
  ice: "M12 2l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4zm0 6l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z",
  fighting: "M12 2C8 2 5 5 5 9v8c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V9c0-4-3-7-7-7zm-2 12H8v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z",
  poison: "M12 2c-3.3 0-6 2.7-6 6 0 2 1 3.8 2.5 4.9L7 22h10l-1.5-9.1c1.5-1.1 2.5-2.9 2.5-4.9 0-3.3-2.7-6-6-6z",
  ground: "M12 2L2 22h20L12 2zm0 6l6 12H6l6-12z",
  flying: "M12 4c-2.2 0-4 1.8-4 4 0 1.1.5 2.1 1.2 2.8L4 20h16l-5.2-9.2c.7-.7 1.2-1.7 1.2-2.8 0-2.2-1.8-4-4-4z",
  psychic: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 3c1.7 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.3-3 3-3z",
  bug: "M12 2c-2 0-3.5 1.5-3.5 3.5 0 .5.1 1 .3 1.5H5v2h2.2c-.1.3-.2.7-.2 1v1H5v2h2v1c0 .3.1.7.2 1H5v2h3.8c.5 1.2 1.6 2 3.2 2s2.7-.8 3.2-2H19v-2h-2.2c.1-.3.2-.7.2-1v-1h2v-2h-2v-1c0-.3-.1-.7-.2-1H19V7h-3.8c.2-.5.3-1 .3-1.5C15.5 3.5 14 2 12 2z",
  rock: "M12 2L2 9l3 11h14l3-11L12 2z",
  ghost: "M12 2C7 2 3 6 3 11v9c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-2h6v2c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-9c0-5-4-9-9-9zm-3 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z",
  dragon: "M12 2c-3 0-5.5 2-6.3 4.8L2 10l3.7 3.2c.8 2.8 3.3 4.8 6.3 4.8s5.5-2 6.3-4.8L22 10l-3.7-3.2C17.5 4 15 2 12 2z",
  dark: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.3 0 2.5-.3 3.6-.7-3.1-1.4-5.6-4.5-5.6-8.3s2.5-6.9 5.6-8.3C14.5 2.3 13.3 2 12 2z",
  steel: "M12 2L5 5v6c0 5.5 3 10.7 7 12 4-1.3 7-6.5 7-12V5l-7-3z",
  fairy: "M12 2l-2 6-6 2 6 2 2 6 2-6 6-2-6-2-2-6z",
}

export function TypeIcon({ type, size = 16, showTooltip = true }: TypeIconProps) {
  const color = typeColors[type] || typeColors.normal
  const path = typeSymbols[type] || typeSymbols.normal

  return (
    <div className="relative group">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={color}
        className="drop-shadow-sm"
        aria-label={type}
      >
        <path d={path} />
      </svg>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap capitalize z-50">
          {type}
        </div>
      )}
    </div>
  )
}
