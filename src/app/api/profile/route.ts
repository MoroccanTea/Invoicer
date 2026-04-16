import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db/mongoose'
import User from '@/lib/models/User'
import { logActivity } from '@/lib/models/ActivityLog'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(session.user.id).select(
      'firstName lastName email cnie phone language notificationsEnabled taxReminderEnabled'
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error: any) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    await connectDB()

    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if email is being changed and if it's unique
    if (body.email && body.email !== user.email) {
      const existingUser = await User.findOne({ email: body.email.toLowerCase() })
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        )
      }
    }

    // Update allowed fields
    const allowedFields = [
      'firstName',
      'lastName',
      'email',
      'cnie',
      'phone',
      'language',
      'notificationsEnabled',
      'taxReminderEnabled',
    ]

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        (user as any)[field] = body[field]
      }
    })

    await user.save()

    // Log activity
    await logActivity(
      'user_updated',
      user._id,
      `${user.firstName} ${user.lastName} updated their profile`,
      { entityType: 'user', entityId: user._id }
    )

    return NextResponse.json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      cnie: user.cnie,
      phone: user.phone,
      language: user.language,
      notificationsEnabled: user.notificationsEnabled,
      taxReminderEnabled: user.taxReminderEnabled,
    })
  } catch (error: any) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
