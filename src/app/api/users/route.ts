import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db/mongoose'
import User from '@/lib/models/User'
import { logActivity } from '@/lib/models/ActivityLog'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin' && !session.user.permissions?.users?.view) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()

    const users = await User.find().select('-password').sort({ createdAt: -1 })

    return NextResponse.json(users)
  } catch (error: any) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin' && !session.user.permissions?.users?.create) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    await connectDB()

    // Check if email already exists
    const existingUser = await User.findOne({ email: body.email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      )
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(8).toString('base64').slice(0, 12)

    const user = await User.create({
      ...body,
      email: body.email.toLowerCase(),
      password: tempPassword,
      mustChangePassword: true,
    })

    // Log activity
    await logActivity(
      'user_created',
      session.user.id,
      `Created user: ${user.firstName} ${user.lastName}`,
      { entityType: 'user', entityId: user._id }
    )

    // Return user without password but include temp password for admin
    const userResponse = user.toObject() as any
    delete userResponse.password

    return NextResponse.json(
      { ...userResponse, tempPassword },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
