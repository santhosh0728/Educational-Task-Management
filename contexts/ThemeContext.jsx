"use client"

import { createContext, useContext, useState, useEffect } from "react"

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme")
    return saved || "light"
  })

  useEffect(() => {
    localStorage.setItem("theme", theme)
    document.documentElement.setAttribute("data-theme", theme)
    
    // Apply theme to body class for better CSS targeting
    document.body.className = document.body.className.replace(/theme-\w+/g, '')
    document.body.classList.add(`theme-${theme}`)
    
    // Apply CSS variables based on theme
    const root = document.documentElement
    if (theme === "dark") {
      root.style.setProperty("--bs-body-bg", "#1a1a1a")
      root.style.setProperty("--bs-body-color", "#ffffff")
      root.style.setProperty("--bs-card-bg", "#2d2d2d")
      root.style.setProperty("--bs-border-color", "#404040")
    } else {
      root.style.setProperty("--bs-body-bg", "#ffffff")
      root.style.setProperty("--bs-body-color", "#212529")
      root.style.setProperty("--bs-card-bg", "#ffffff")
      root.style.setProperty("--bs-border-color", "#dee2e6")
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  const setSpecificTheme = (newTheme) => {
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setSpecificTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}