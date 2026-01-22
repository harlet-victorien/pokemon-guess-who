"use client"

import { Settings, Sun, Moon, Languages, Grid3X3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSettings } from "@/contexts/SettingsContext"

export function SettingsMenu() {
  const { language, setLanguage, theme, setTheme, gridLayout, setGridLayout, t } = useSettings()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="size-4" />
          <span className="sr-only">{t("settings")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{t("settings")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal flex items-center gap-2">
            <Sun className="size-3" />
            {t("theme")}
          </DropdownMenuLabel>
          <DropdownMenuItem 
            onClick={() => setTheme("light")}
            className={theme === "light" ? "bg-accent" : ""}
          >
            <Sun className="size-4" />
            {t("light")}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setTheme("dark")}
            className={theme === "dark" ? "bg-accent" : ""}
          >
            <Moon className="size-4" />
            {t("dark")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal flex items-center gap-2">
            <Languages className="size-3" />
            {t("language")}
          </DropdownMenuLabel>
          <DropdownMenuItem 
            onClick={() => setLanguage("en")}
            className={language === "en" ? "bg-accent" : ""}
          >
            English
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setLanguage("fr")}
            className={language === "fr" ? "bg-accent" : ""}
          >
            Francais
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal flex items-center gap-2">
            <Grid3X3 className="size-3" />
            {t("gridLayout")}
          </DropdownMenuLabel>
          <DropdownMenuItem 
            onClick={() => setGridLayout("8x5")}
            className={gridLayout === "8x5" ? "bg-accent" : ""}
          >
            8 x 5
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setGridLayout("5x8")}
            className={gridLayout === "5x8" ? "bg-accent" : ""}
          >
            5 x 8
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
