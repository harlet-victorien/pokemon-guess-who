"use client"

import React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSettings } from "@/contexts/SettingsContext"

export function JoinForm() {
  const router = useRouter()
  const { t } = useSettings()
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const validateInputs = (): boolean => {
    if (name.length < 1 || name.length > 20) {
      setError(t("nameError"))
      return false
    }
    if (code.length < 1 || code.length > 10 || !/^[a-zA-Z0-9]+$/.test(code)) {
      setError(t("codeError"))
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
        setError(data.error || t("joinError"))
        return
      }

      sessionStorage.setItem("playerName", name)
      router.push(`/game/${code.toLowerCase()}`)
    } catch {
      setError(t("connectionError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t("joinGame")}</CardTitle>
        <CardDescription>
          {t("joinDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          <div className="flex flex-col gap-2">
            <label htmlFor="code" className="text-sm font-medium">
              {t("roomCode")}
            </label>
            <Input
              id="code"
              type="text"
              placeholder={t("enterRoomCode")}
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
            {loading ? t("joining") : t("join")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
