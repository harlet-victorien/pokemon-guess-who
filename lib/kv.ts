import { Redis } from "@upstash/redis"
import type { Room } from "@/types"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const ROOM_TTL = 3600 // 1 hour

export async function getRoom(code: string): Promise<Room | null> {
  const room = await redis.get<Room>(`room:${code}`)
  return room
}

export async function setRoom(code: string, room: Room): Promise<void> {
  await redis.set(`room:${code}`, room, { ex: ROOM_TTL })
}

export async function deleteRoom(code: string): Promise<void> {
  await redis.del(`room:${code}`)
}
