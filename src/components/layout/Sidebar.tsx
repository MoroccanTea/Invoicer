'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  FiHome,
  FiUsers,
  FiFolder,
  FiFileText,
  FiSettings,
  FiUser,
  FiLogOut,
  FiX,
  FiUserPlus,
} from 'react-icons/fi'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: FiHome },
  { name: 'Clients', href: '/dashboard/clients', icon: FiUsers },
  { name: 'Projects', href: '/dashboard/projects', icon: FiFolder },
  { name: 'Invoices', href: '/dashboard/invoices', icon: FiFileText },
  { name: 'Users', href: '/dashboard/users', icon: FiUserPlus, adminOnly: true },
  { name: 'Configuration', href: '/dashboard/configuration', icon: FiSettings },
  { name: 'Profile', href: '/dashboard/profile', icon: FiUser },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const filteredNavigation = navigation.filter((item) => {
    if (item.adminOnly && session?.user?.role !== 'admin') {
      return session?.user?.permissions?.users?.view
    }
    return true
  })

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-700 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Invoicer
              </span>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <span className="text-primary-700 dark:text-primary-300 font-medium">
                  {session?.user?.firstName?.[0]}
                  {session?.user?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {session?.user?.firstName} {session?.user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full mt-2 flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <FiLogOut className="w-5 h-5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
