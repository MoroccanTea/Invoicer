'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiSave,
  FiBell,
  FiGlobe,
  FiShield,
  FiCheckCircle,
  FiAlertTriangle,
} from 'react-icons/fi'

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  cnie: string
  phone: string
  language: 'en' | 'fr' | 'ar' | 'es'
  notificationsEnabled: boolean
  taxReminderEnabled: boolean
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [show2FADisable, setShow2FADisable] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    cnie: '',
    phone: '',
    language: 'en',
    notificationsEnabled: false,
    taxReminderEnabled: false,
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      const data = await response.json()
      if (response.ok) {
        setProfile({
          firstName: data.firstName ?? '',
          lastName: data.lastName ?? '',
          email: data.email ?? '',
          cnie: data.cnie ?? '',
          phone: data.phone ?? '',
          language: data.language ?? 'en',
          notificationsEnabled: data.notificationsEnabled ?? false,
          taxReminderEnabled: data.taxReminderEnabled ?? false,
        })
        setTwoFactorEnabled(data.twoFactorEnabled ?? false)
      }
    } catch (error) {
      toast.error('Failed to load profile')
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setProfile((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      // Update session with new data
      await update({
        firstName: profile.firstName,
        lastName: profile.lastName,
        language: profile.language,
      })

      toast.success('Profile updated successfully')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your personal information and preferences
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiUser className="w-5 h-5" />
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">CNIE (ID Number)</label>
                <input
                  type="text"
                  name="cnie"
                  value={profile.cnie}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., AB123456"
                />
              </div>

              <div>
                <label className="label">Phone</label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="input-field pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiMail className="w-5 h-5" />
              Account Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="label">Email *</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Language</label>
                <div className="relative">
                  <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    name="language"
                    value={profile.language}
                    onChange={handleChange}
                    className="input-field pl-10"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="ar">العربية</option>
                    <option value="es">Español</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <FiLock className="w-4 h-4" />
                Change Password
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiBell className="w-5 h-5" />
              Notifications
            </h2>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="notificationsEnabled"
                  checked={profile.notificationsEnabled}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-primary-700 focus:ring-primary-500"
                />
                <div>
                  <span className="text-gray-900 dark:text-white font-medium">
                    Email Notifications
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive email notifications for important updates
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="taxReminderEnabled"
                  checked={profile.taxReminderEnabled}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-primary-700 focus:ring-primary-500"
                />
                <div>
                  <span className="text-gray-900 dark:text-white font-medium">
                    Tax Payment Reminders
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get reminded to pay taxes quarterly (Jan, Apr, Jul, Oct)
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiShield className="w-5 h-5" />
              Two-Factor Authentication
            </h2>

            <div className="flex items-start justify-between gap-4">
              <div>
                {twoFactorEnabled ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                    <FiCheckCircle className="w-4 h-4" />
                    <span className="font-medium text-sm">2FA is enabled</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mb-1">
                    <FiAlertTriangle className="w-4 h-4" />
                    <span className="font-medium text-sm">2FA is not enabled</span>
                  </div>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {twoFactorEnabled
                    ? 'Your account is protected with an authenticator app.'
                    : 'Add an extra layer of security with a TOTP authenticator app.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => twoFactorEnabled ? setShow2FADisable(true) : setShow2FASetup(true)}
                className={twoFactorEnabled ? 'btn-danger whitespace-nowrap' : 'btn-primary whitespace-nowrap'}
              >
                {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <PasswordModal onClose={() => setShowPasswordModal(false)} />
      )}

      {/* 2FA Setup Modal */}
      {show2FASetup && (
        <TwoFASetupModal
          onClose={() => setShow2FASetup(false)}
          onEnabled={() => { setTwoFactorEnabled(true); setShow2FASetup(false) }}
        />
      )}

      {/* 2FA Disable Modal */}
      {show2FADisable && (
        <TwoFADisableModal
          onClose={() => setShow2FADisable(false)}
          onDisabled={() => { setTwoFactorEnabled(false); setShow2FADisable(false) }}
        />
      )}
    </div>
  )
}

function PasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password')
      }

      toast.success('Password changed successfully')
      onClose()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Change Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="label">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1">
              {isLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TwoFASetupModal({
  onClose,
  onEnabled,
}: {
  onClose: () => void
  onEnabled: () => void
}) {
  const [step, setStep] = useState<'qr' | 'verify' | 'backup'>('qr')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [token, setToken] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/auth/2fa/setup')
      .then(r => r.json())
      .then(data => {
        setQrCode(data.qrCode)
        setSecret(data.secret)
      })
      .catch(() => toast.error('Failed to initialize 2FA setup'))
  }, [])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setBackupCodes(data.backupCodes)
      setStep('backup')
    } catch (err: any) {
      toast.error(err.message || 'Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const copySecret = () => {
    navigator.clipboard.writeText(secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
        {step === 'qr' && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Set Up Two-Factor Authentication
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Scan the QR code with your authenticator app (e.g. Google Authenticator, Authy).
            </p>
            <div className="flex justify-center mb-4 bg-white p-3 rounded-lg">
              {qrCode
                ? <img src={qrCode} alt="2FA QR Code" className="w-44 h-44" />
                : <div className="w-44 h-44 animate-pulse bg-gray-200 rounded" />}
            </div>
            <p className="text-xs text-center text-gray-500 mb-2">Or enter this code manually:</p>
            <div className="flex items-center gap-2 mb-4">
              <code className="flex-1 bg-gray-100 dark:bg-gray-700 rounded px-3 py-2 text-xs font-mono break-all">
                {secret || '...'}
              </code>
              <button type="button" onClick={copySecret} className="btn-secondary text-xs px-3">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="button" onClick={() => setStep('verify')} className="btn-primary flex-1" disabled={!qrCode}>
                Next
              </button>
            </div>
          </>
        )}

        {step === 'verify' && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Verify Your Code</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Enter the 6-digit code shown in your authenticator app to confirm setup.
            </p>
            <form onSubmit={handleVerify} className="space-y-4">
              <input
                type="text"
                value={token}
                onChange={e => setToken(e.target.value)}
                className="input-field text-center text-xl tracking-widest font-mono"
                placeholder="000 000"
                maxLength={7}
                autoComplete="one-time-code"
                autoFocus
                required
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep('qr')} className="btn-secondary flex-1">Back</button>
                <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                  {isLoading ? 'Verifying...' : 'Enable 2FA'}
                </button>
              </div>
            </form>
          </>
        )}

        {step === 'backup' && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Save Your Backup Codes</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Store these codes somewhere safe. Each can be used once if you lose access to your authenticator app.
            </p>
            <p className="text-xs text-red-500 mb-4 font-medium">These will not be shown again.</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {backupCodes.map(code => (
                <code key={code} className="bg-gray-100 dark:bg-gray-700 rounded px-3 py-2 text-sm font-mono text-center tracking-widest">
                  {code}
                </code>
              ))}
            </div>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(backupCodes.join('\n'))}
              className="btn-secondary w-full mb-3"
            >
              Copy All Codes
            </button>
            <button type="button" onClick={onEnabled} className="btn-primary w-full">
              Done — I've saved my codes
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function TwoFADisableModal({
  onClose,
  onDisabled,
}: {
  onClose: () => void
  onDisabled: () => void
}) {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('2FA has been disabled')
      onDisabled()
    } catch (err: any) {
      toast.error(err.message || 'Failed to disable 2FA')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Disable 2FA</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Enter your password to confirm disabling two-factor authentication.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field"
              required
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn-danger flex-1">
              {isLoading ? 'Disabling...' : 'Disable 2FA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
