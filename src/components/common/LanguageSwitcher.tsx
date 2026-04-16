'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiGlobe, FiCheck } from 'react-icons/fi'
import { locales, localeNames, type Locale } from '@/i18n/config'

export default function LanguageSwitcher() {
  const router = useRouter()
  const [currentLocale, setCurrentLocale] = useState<Locale>('en')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Get current locale from cookie
    const locale = document.cookie
      .split('; ')
      .find((row) => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1] as Locale | undefined

    if (locale && locales.includes(locale)) {
      setCurrentLocale(locale)
    }
  }, [])

  const changeLanguage = async (locale: Locale) => {
    // Set cookie
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000` // 1 year

    // Update user preference in database
    try {
      await fetch('/api/users/me/language', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: locale }),
      })
    } catch (error) {
      console.error('Failed to update language preference:', error)
    }

    setCurrentLocale(locale)
    setIsOpen(false)

    // Refresh the page to apply new language
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
        title="Change language"
      >
        <FiGlobe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        <span className="hidden sm:inline text-sm text-gray-700 dark:text-gray-300">
          {localeNames[currentLocale]}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="py-1">
              {locales.map((locale) => (
                <button
                  key={locale}
                  onClick={() => changeLanguage(locale)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                >
                  <span className="text-gray-700 dark:text-gray-300">
                    {localeNames[locale]}
                  </span>
                  {currentLocale === locale && (
                    <FiCheck className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
