import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import connectDB from '@/lib/db/mongoose'
import User, { IUser } from '@/lib/models/User'
import { logActivity } from '@/lib/models/ActivityLog'
import { initializeAdmin } from './initAdmin'
import { getRedisClient } from '@/lib/db/redis'
import { checkRateLimit } from '@/lib/rateLimit'
import speakeasy from 'speakeasy'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      role: 'admin' | 'manager' | 'user'
      permissions: IUser['permissions']
      mustChangePassword: boolean
      language: string
    }
  }

  interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    role: 'admin' | 'manager' | 'user'
    permissions: IUser['permissions']
    mustChangePassword: boolean
    language: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    firstName: string
    lastName: string
    role: 'admin' | 'manager' | 'user'
    permissions: IUser['permissions']
    mustChangePassword: boolean
    language: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        totpCode: { label: 'Authenticator Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        // Rate limit: 10 attempts per 15 minutes per email
        const rl = await checkRateLimit(`login:${credentials.email.toLowerCase()}`, 10, 900)
        if (!rl.allowed) {
          throw new Error(`Too many login attempts. Try again in ${rl.retryAfterSeconds} seconds`)
        }

        await connectDB()

        // Auto-initialize admin on first login attempt if no admin exists
        await initializeAdmin()

        const user = await User.findOne({
          email: credentials.email.toLowerCase(),
          isActive: true,
        }).select('+password +twoFactorSecret')

        if (!user) {
          throw new Error('Invalid email or password')
        }

        const isPasswordValid = await user.comparePassword(credentials.password)

        if (!isPasswordValid) {
          throw new Error('Invalid email or password')
        }

        // 2FA check — if enabled, require a valid TOTP code or backup nonce
        if (user.twoFactorEnabled) {
          if (!credentials.totpCode) {
            throw new Error('TWO_FACTOR_REQUIRED')
          }

          // Check if this is a backup-code nonce issued by /api/auth/2fa/backup
          let backupVerified = false
          if (credentials.totpCode.length === 64) {
            try {
              const redis = getRedisClient()
              const redisKey = `2fa_backup_nonce:${user._id}`
              const storedNonce = await redis.get(redisKey)
              if (storedNonce && storedNonce === credentials.totpCode) {
                await redis.del(redisKey)
                backupVerified = true
              }
            } catch {
              // Redis failure — fall through to TOTP verification
            }
          }

          if (!backupVerified) {
            const verified = speakeasy.totp.verify({
              secret: user.twoFactorSecret!,
              encoding: 'base32',
              token: credentials.totpCode.replace(/\s/g, ''),
              window: 1,
            })

            if (!verified) {
              throw new Error('Invalid authenticator code')
            }
          }
        }

        // Update last login
        user.lastLogin = new Date()
        await user.save()

        // Log activity
        await logActivity('user_login', user._id, `${user.firstName} ${user.lastName} logged in`)

        return {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          permissions: user.permissions,
          mustChangePassword: user.mustChangePassword,
          language: user.language,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.role = user.role
        token.permissions = user.permissions
        token.mustChangePassword = user.mustChangePassword
        token.language = user.language
      }

      // Handle session updates — only allow safe, non-privileged fields
      if (trigger === 'update' && session) {
        const allowedUpdateFields = ['mustChangePassword', 'firstName', 'lastName', 'language'] as const
        const safeUpdates: Partial<typeof token> = {}
        for (const field of allowedUpdateFields) {
          if (field in session && session[field] !== undefined) {
            (safeUpdates as any)[field] = session[field]
          }
        }
        return { ...token, ...safeUpdates }
      }

      return token
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        firstName: token.firstName,
        lastName: token.lastName,
        role: token.role,
        permissions: token.permissions,
        mustChangePassword: token.mustChangePassword,
        language: token.language,
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
}
