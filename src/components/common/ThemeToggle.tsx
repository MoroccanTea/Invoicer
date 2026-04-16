'use client'

import { useTheme } from '@/components/providers/ThemeProvider'
import { FiSun, FiMoon } from 'react-icons/fi'

export default function ThemeToggle() {
  const { actualTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(actualTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 p-3 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-110 transition-all duration-200"
      aria-label="Toggle theme"
    >
      {actualTheme === 'dark' ? (
        <FiSun className="w-5 h-5 text-yellow-500" />
      ) : (
        <FiMoon className="w-5 h-5 text-gray-700" />
      )}
    </button>
  )
}
