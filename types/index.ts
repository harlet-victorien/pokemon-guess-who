import type { Language } from "@/lib/translations"

export interface Room {
  players: string[]
  seed: number | null
  started: boolean
  createdAt: number
}

export interface Pokemon {
  id: number
  name: string
  names: Record<Language, string>
  sprite: string
  types: string[]
  generation: number
  evolutionStage: number
}

export interface RoomResponse {
  success: boolean
  room?: Room
  error?: string
}
