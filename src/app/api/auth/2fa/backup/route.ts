import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongoose'
import User from '@/lib/models/User'
import crypto from 'crypto'

/**
 * @openapi
 * /api/auth/2fa/backup:
 *   post:
 *     summary: Verify a backup code during 2FA login (consumes the code)
 *     description: Used when user cannot access their authenticator app. Each code can only be used once.
 *     tags: [Auth - 2FA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, backupCode]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               backupCode:
 *                 type: string
 *                 description: One of the 8 backup codes shown when 2FA was enabled
 *     responses:
 *       200:
 *         description: Backup code valid — proceed with signIn
 *       400:
 *         description: Invalid backup code
 *       404:
 *         description: User not found
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, password, backupCode } = body

  if (!email || !password || !backupCode) {
    return NextResponse.json({ error: 'email, password, and backupCode are required' }, { status: 400 })
  }

  await connectDB()

  const user = await User.findOne({ email: email.toLowerCase(), isActive: true })
    .select('+password +twoFactorBackupCodes')

  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 })
  }

  const isPasswordValid = await user.comparePassword(password)
  if (!isPasswordValid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 })
  }

  if (!user.twoFactorEnabled || !user.twoFactorBackupCodes?.length) {
    return NextResponse.json({ error: '2FA is not enabled for this account' }, { status: 400 })
  }

  const hashed = crypto.createHash('sha256').update(backupCode.trim().toUpperCase()).digest('hex')
  const index = user.twoFactorBackupCodes.indexOf(hashed)

  if (index === -1) {
    return NextResponse.json({ error: 'Invalid or already used backup code' }, { status: 400 })
  }

  // Consume the code (one-time use)
  user.twoFactorBackupCodes.splice(index, 1)
  await user.save()

  return NextResponse.json({ valid: true, codesRemaining: user.twoFactorBackupCodes.length })
}
