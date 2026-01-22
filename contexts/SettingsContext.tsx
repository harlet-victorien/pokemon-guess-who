"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { translations, type Language } from "@/lib/translations"

export type Theme = "light" | "dark"
export type GridLayout = "8x5" | "5x8"

interface SettingsContextType {
  language: Language
  setLanguage: (lang: Language) => void
  theme: Theme
  setTheme: (theme: Theme) => void
  gridLayout: GridLayout
  setGridLayout: (layout: GridLayout) => void
  t: (key: keyof typeof translations.en) => string
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const [theme, setThemeState] = useState<Theme>("light")
  const [gridLayout, setGridLayoutState] = useState<GridLayout>("8x5")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Load saved settings
    const savedLang = localStorage.getItem("pokemon-guess-who-lang") as Language | null
    if (savedLang && (savedLang === "en" || savedLang === "fr")) {
      setLanguageState(savedLang)
    }
    
    const savedTheme = localStorage.getItem("pokemon-guess-who-theme") as Theme | null
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      setThemeState(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setThemeState(prefersDark ? "dark" : "light")
      document.documentElement.classList.toggle("dark", prefersDark)
    }
    
    const savedGrid = localStorage.getItem("pokemon-guess-who-grid") as GridLayout | null
    if (savedGrid && (savedGrid === "8x5" || savedGrid === "5x8")) {
      setGridLayoutState(savedGrid)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("pokemon-guess-who-lang", lang)
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("pokemon-guess-who-theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const setGridLayout = (layout: GridLayout) => {
    setGridLayoutState(layout)
    localStorage.setItem("pokemon-guess-who-grid", layout)
  }

  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key] || translations.en[key] || key
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <SettingsContext.Provider value={{ 
        language: "en", 
        setLanguage: () => {}, 
        theme: "light", 
        setTheme: () => {}, 
        gridLayout: "8x5", 
        setGridLayout: () => {},
        t: (key) => translations.en[key] || key 
      }}>
        {children}
      </SettingsContext.Provider>
    )
  }

  return (
    <SettingsContext.Provider value={{ language, setLanguage, theme, setTheme, gridLayout, setGridLayout, t }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
