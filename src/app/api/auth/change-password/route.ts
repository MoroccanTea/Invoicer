import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db/mongoose'
import User from '@/lib/models/User'
import { logActivity } from '@/lib/models/ActivityLog'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    // Validate new password
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters' },
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findById(session.user.id).select('+password')

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Update password
    user.password = newPassword
    user.mustChangePassword = false
    await user.save()

    // Log activity
    await logActivity(
      'password_changed',
      user._id,
      `${user.firstName} ${user.lastName} changed their password`
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
