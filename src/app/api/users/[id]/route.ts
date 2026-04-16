import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db/mongoose'
import User from '@/lib/models/User'
import { logActivity } from '@/lib/models/ActivityLog'
import { isValidObjectId, invalidIdResponse } from '@/lib/utils/objectId'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isValidObjectId(id)) return invalidIdResponse()

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin' && !session.user.permissions?.users?.view) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()

    const user = await User.findById(id).select('-password')

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error: any) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isValidObjectId(id)) return invalidIdResponse()

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin' && !session.user.permissions?.users?.edit) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    await connectDB()

    const user = await User.findById(id)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent editing own role or deactivating self
    if (id === session.user.id) {
      if (body.role && body.role !== user.role) {
        return NextResponse.json(
          { error: 'You cannot change your own role' },
          { status: 400 }
        )
      }
      if (body.isActive === false) {
        return NextResponse.json(
          { error: 'You cannot deactivate your own account' },
          { status: 400 }
        )
      }
    }

    // Update allowed fields
    const allowedFields = ['firstName', 'lastName', 'role', 'permissions', 'isActive']

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        (user as any)[field] = body[field]
      }
    })

    await user.save()

    // Log activity
    await logActivity(
      'user_updated',
      session.user.id,
      `Updated user: ${user.firstName} ${user.lastName}`,
      { entityType: 'user', entityId: user._id }
    )

    // Return without password
    const userResponse = user.toObject() as any
    delete userResponse.password

    return NextResponse.json(userResponse)
  } catch (error: any) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isValidObjectId(id)) return invalidIdResponse()

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin' && !session.user.permissions?.users?.delete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Prevent self-deletion
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findById(id)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent deleting admins (unless you're also an admin)
    if (user.role === 'admin' && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'You cannot delete admin users' },
        { status: 403 }
      )
    }

    await user.deleteOne()

    // Log activity
    await logActivity(
      'user_deleted',
      session.user.id,
      `Deleted user: ${user.firstName} ${user.lastName}`,
      { entityType: 'user', entityId: user._id }
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
