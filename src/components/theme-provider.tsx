import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  actualTheme: "dark" | "light"
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "light",
  actualTheme: "light",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "veeqai-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme
    return (localStorage.getItem(storageKey) as Theme) || defaultTheme
  })

  const [actualTheme, setActualTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "light"
    const storedTheme = (localStorage.getItem(storageKey) as Theme) || defaultTheme
    if (storedTheme === "system") return getSystemTheme()
    return storedTheme === "dark" ? "dark" : "light"
  })

  useEffect(() => {
    const root = window.document.documentElement
    
    const updateActualTheme = () => {
      let newActualTheme: "dark" | "light"
      
      if (theme === "system") {
        newActualTheme = getSystemTheme()
      } else {
        newActualTheme = theme === "dark" ? "dark" : "light"
      }
      
      setActualTheme(newActualTheme)
      
      root.classList.remove("light", "dark")
      root.classList.add(newActualTheme)
    }

    updateActualTheme()

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleSystemThemeChange = () => updateActualTheme()
      
      mediaQuery.addEventListener("change", handleSystemThemeChange)
      return () => mediaQuery.removeEventListener("change", handleSystemThemeChange)
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme)
    setThemeState(newTheme)
  }

  const value = {
    theme,
    actualTheme,
    setTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}