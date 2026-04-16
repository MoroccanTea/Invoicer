'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi'
import ThemeToggle from '@/components/common/ThemeToggle'

type LoginStep = 'credentials' | '2fa'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<LoginStep>('credentials')
  const [useBackupCode, setUseBackupCode] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.mustChangePassword) {
        router.push('/change-password')
      } else {
        router.push('/dashboard')
      }
    }
  }, [session, status, router])

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error === 'TWO_FACTOR_REQUIRED') {
        setStep('2fa')
        setTotpCode('')
      } else if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Welcome back!')
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (useBackupCode) {
        // Verify backup code via API, then complete sign-in
        const res = await fetch('/api/auth/2fa/backup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, backupCode: totpCode }),
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error || 'Invalid backup code')
          return
        }
        // Backup code valid — now complete the sign-in with a sentinel TOTP code
        // We use a special bypass token; the backup route already authenticated the user.
        // Complete sign-in by re-signing with credentials (no 2FA check needed now).
        // To avoid re-checking 2FA we temporarily disable it via the bypass header.
        const signInResult = await signIn('credentials', {
          email,
          password,
          totpCode: '__BACKUP_VERIFIED__',
          redirect: false,
        })
        if (signInResult?.error) {
          toast.error('Sign-in failed after backup code verification')
          return
        }
      } else {
        const result = await signIn('credentials', {
          email,
          password,
          totpCode,
          redirect: false,
        })

        if (result?.error) {
          toast.error(result.error)
          return
        }
      }

      toast.success('Welcome back!')
      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-700"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <ThemeToggle />
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-700 text-white mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoicer</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Professional Billing Management</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {step === 'credentials' ? (
            <>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Sign in to your account
              </h2>
              <form onSubmit={handleCredentialsSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="label">Email address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-10"
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="label">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pl-10 pr-10"
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword
                        ? <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        : <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="w-full btn-primary py-3 text-base">
                  {isLoading ? <Spinner text="Signing in..." /> : 'Sign in'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <FiShield className="w-5 h-5 text-primary-700" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Two-Factor Authentication
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {useBackupCode ? 'Enter a backup code' : 'Enter the code from your authenticator app'}
                  </p>
                </div>
              </div>

              <form onSubmit={handle2FASubmit} className="space-y-5">
                <div>
                  <label className="label">
                    {useBackupCode ? 'Backup Code' : 'Authenticator Code'}
                  </label>
                  <input
                    type="text"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    className="input-field text-center text-lg tracking-widest font-mono"
                    placeholder={useBackupCode ? 'XXXXXXXX' : '000 000'}
                    maxLength={useBackupCode ? 8 : 7}
                    autoComplete="one-time-code"
                    autoFocus
                    required
                  />
                </div>

                <button type="submit" disabled={isLoading || totpCode.replace(/\s/g, '').length < 6}
                  className="w-full btn-primary py-3 text-base">
                  {isLoading ? <Spinner text="Verifying..." /> : 'Verify'}
                </button>

                <div className="flex items-center justify-between pt-2 text-sm">
                  <button
                    type="button"
                    onClick={() => { setStep('credentials'); setTotpCode('') }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUseBackupCode(!useBackupCode); setTotpCode('') }}
                    className="text-primary-700 hover:text-primary-800 font-medium"
                  >
                    {useBackupCode ? 'Use authenticator app' : 'Use backup code'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          First time? Check the console for initial admin credentials.
        </p>
      </div>
    </div>
  )
}

function Spinner({ text }: { text: string }) {
  return (
    <span className="flex items-center justify-center">
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      {text}
    </span>
  )
}
