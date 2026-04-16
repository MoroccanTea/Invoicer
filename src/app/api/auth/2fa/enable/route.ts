import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db/mongoose'
import User from '@/lib/models/User'
import speakeasy from 'speakeasy'
import crypto from 'crypto'
import { sendMail, isEmailConfigured } from '@/lib/email/mailer'
import { twoFABackupCodesTemplate } from '@/lib/email/templates'

function generateBackupCodes(count = 8): string[] {
  return Array.from({ length: count }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  )
}

/**
 * @openapi
 * /api/auth/2fa/enable:
 *   post:
 *     summary: Verify TOTP token and activate 2FA for the current user
 *     tags: [Auth - 2FA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 description: 6-digit TOTP code from authenticator app
 *     responses:
 *       200:
 *         description: 2FA enabled, returns backup codes
 *       400:
 *         description: Invalid token or 2FA already enabled
 *       401:
 *         description: Unauthorized
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { token } = body

  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'TOTP token is required' }, { status: 400 })
  }

  await connectDB()

  const user = await User.findById(session.user.id).select('+twoFactorSecret +twoFactorBackupCodes')
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (user.twoFactorEnabled) {
    return NextResponse.json({ error: '2FA is already enabled' }, { status: 400 })
  }

  if (!user.twoFactorSecret) {
    return NextResponse.json({ error: 'Run 2FA setup first' }, { status: 400 })
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: token.replace(/\s/g, ''),
    window: 1, // allow 1 step clock drift
  })

  if (!verified) {
    return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
  }

  const backupCodes = generateBackupCodes(8)
  // Hash backup codes before storing
  const hashedCodes = backupCodes.map(c => crypto.createHash('sha256').update(c).digest('hex'))

  user.twoFactorEnabled = true
  user.twoFactorBackupCodes = hashedCodes
  await user.save()

  // Email backup codes if SMTP is configured
  if (isEmailConfigured()) {
    sendMail({
      to: user.email,
      subject: 'Your 2FA Backup Codes — Invoicer',
      html: twoFABackupCodesTemplate({ firstName: user.firstName, backupCodes }),
    }).catch(() => {}) // non-blocking — codes are returned in the response too
  }

  return NextResponse.json({
    message: '2FA enabled successfully',
    backupCodes, // shown once — user must save these
  })
}
