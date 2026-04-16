'use client'

import { useTheme } from '@/components/providers/ThemeProvider'
import { FiMenu, FiSun, FiMoon, FiBell } from 'react-icons/fi'
import { useSession } from 'next-auth/react'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'

interface HeaderProps {
  onMenuClick: () => void
  title?: string
}

export default function Header({ onMenuClick, title }: HeaderProps) {
  const { theme, setTheme, actualTheme } = useTheme()
  const { data: session } = useSession()

  const toggleTheme = () => {
    setTheme(actualTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiMenu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          {title && (
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          {session?.user?.role === 'admin' && (
            <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <FiBell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              {/* Notification dot */}
              {/* <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" /> */}
            </button>
          )}

          {/* Language switcher */}
          <LanguageSwitcher />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title={`Switch to ${actualTheme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {actualTheme === 'dark' ? (
              <FiSun className="w-5 h-5 text-yellow-500" />
            ) : (
              <FiMoon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
