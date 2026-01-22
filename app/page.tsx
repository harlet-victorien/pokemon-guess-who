"use client"

import { JoinForm } from "@/components/JoinForm"
import { SettingsMenu } from "@/components/SettingsMenu"
import { useSettings } from "@/contexts/SettingsContext"

export default function Home() {
  const { t } = useSettings()

  return (
    <main className="min-h-screen bg-secondary/30 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <SettingsMenu />
      </div>
      <div className="flex flex-col items-center gap-8 w-full max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <JoinForm />
        <p className="text-xs text-center text-muted-foreground max-w-sm">
          {t("gameDescription")}
        </p>
      </div>
    </main>
  )
}
