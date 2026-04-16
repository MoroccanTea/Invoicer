import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db/mongoose'
import User from '@/lib/models/User'

/**
 * @openapi
 * /api/auth/2fa/disable:
 *   post:
 *     summary: Disable 2FA for the current user (requires password confirmation)
 *     tags: [Auth - 2FA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 description: Current account password for confirmation
 *     responses:
 *       200:
 *         description: 2FA disabled
 *       400:
 *         description: Invalid password or 2FA not enabled
 *       401:
 *         description: Unauthorized
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { password } = body

  if (!password) {
    return NextResponse.json({ error: 'Password is required' }, { status: 400 })
  }

  await connectDB()

  const user = await User.findById(session.user.id).select('+password +twoFactorSecret +twoFactorBackupCodes')
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (!user.twoFactorEnabled) {
    return NextResponse.json({ error: '2FA is not enabled' }, { status: 400 })
  }

  const isPasswordValid = await user.comparePassword(password)
  if (!isPasswordValid) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 400 })
  }

  user.twoFactorEnabled = false
  user.twoFactorSecret = undefined
  user.twoFactorBackupCodes = undefined
  await user.save()

  return NextResponse.json({ message: '2FA disabled successfully' })
}
