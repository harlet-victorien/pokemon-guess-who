"use client"

import { typeColors } from "@/lib/type-colors"
import { TypeIcon } from "@/components/TypeIcon"

export function TypeLegend() {
  const types = Object.keys(typeColors)

  return (
    <div className="flex flex-col gap-3 p-4 bg-card rounded-lg border">
      <div className="flex flex-wrap gap-2 items-center">
        {types.map((type) => (
          <div 
            key={type} 
            className="flex items-center gap-1.5 px-2 py-1 rounded-md"
            style={{ backgroundColor: `${typeColors[type]}20` }}
          >
            <TypeIcon type={type} size={14} showTooltip={false} />
            <span className="text-xs capitalize text-foreground">{type}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Hover a card to see Generation and Evolution Stage
      </p>
    </div>
  )
}
