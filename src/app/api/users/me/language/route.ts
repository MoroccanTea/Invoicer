import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import User from '@/lib/models/User'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { language } = await request.json()

    // Validate language
    const validLanguages = ['en', 'fr', 'es', 'ar']
    if (!validLanguages.includes(language)) {
      return NextResponse.json(
        { message: 'Invalid language' },
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { language },
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ language: user.language })
  } catch (error) {
    console.error('Error updating language:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
