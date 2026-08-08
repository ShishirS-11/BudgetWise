import { useEffect, useState } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const savedTheme =
      localStorage.getItem('budgetwise-theme')

    if (savedTheme === 'dark') {
      return 'dark'
    }

    return 'light'
  })

  useEffect(() => {
    const root =
      document.documentElement

    root.setAttribute(
      'data-theme',
      theme,
    )

    localStorage.setItem(
      'budgetwise-theme',
      theme,
    )
  }, [theme])

  function toggleTheme() {
    setTheme((currentTheme) => {
      if (currentTheme === 'dark') {
        return 'light'
      }

      return 'dark'
    })
  }

  return {
    theme,
    toggleTheme,
  }
}