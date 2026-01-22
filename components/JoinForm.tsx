"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function JoinForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const validateInputs = (): boolean => {
    if (name.length < 1 || name.length > 20) {
      setError("Name must be 1-20 characters")
      return false
    }
    if (code.length < 1 || code.length > 10 || !/^[a-zA-Z0-9]+$/.test(code)) {
      setError("Room code must be 1-10 alphanumeric characters")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateInputs()) return

    setLoading(true)

    try {
      const response = await fetch(`/api/room/${code.toLowerCase()}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || "Failed to join room")
        return
      }

      // Store player name in sessionStorage for the game page
      sessionStorage.setItem("playerName", name)
      router.push(`/game/${code.toLowerCase()}`)
    } catch {
      setError("Failed to connect to server")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Join a Game</CardTitle>
        <CardDescription>
          Enter your name and a room code to play with a friend
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Your Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="code" className="text-sm font-medium">
              Room Code
            </label>
            <Input
              id="code"
              type="text"
              placeholder="Enter room code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
              maxLength={10}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Joining..." : "Join Game"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
