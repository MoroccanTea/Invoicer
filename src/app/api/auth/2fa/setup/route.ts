import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db/mongoose'
import User from '@/lib/models/User'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

/**
 * @openapi
 * /api/auth/2fa/setup:
 *   get:
 *     summary: Generate a new TOTP secret and QR code for 2FA setup
 *     tags: [Auth - 2FA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Secret and QR code data URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 qrCode:
 *                   type: string
 *                   description: Base64 PNG data URL for the QR code
 *                 secret:
 *                   type: string
 *                   description: Manual entry key
 *       401:
 *         description: Unauthorized
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const user = await User.findById(session.user.id)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (user.twoFactorEnabled) {
    return NextResponse.json({ error: '2FA is already enabled' }, { status: 400 })
  }

  const appName = 'Invoicer'
  const secret = speakeasy.generateSecret({
    name: `${appName} (${user.email})`,
    length: 20,
  })

  // Temporarily store the pending secret (not yet active until verified)
  user.twoFactorSecret = secret.base32
  await user.save()

  const qrCode = await QRCode.toDataURL(secret.otpauth_url!)

  return NextResponse.json({
    qrCode,
    secret: secret.base32, // shown as fallback for manual entry
  })
}
