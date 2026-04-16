import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db/mongoose'
import Client from '@/lib/models/Client'
import { logActivity } from '@/lib/models/ActivityLog'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin' && !session.user.permissions?.clients?.view) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const active = searchParams.get('active')

    let query: any = {}

    if (search) {
      // Escape all regex special characters to prevent ReDoS
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      query.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { ice: { $regex: escapedSearch, $options: 'i' } },
        { contactPerson: { $regex: escapedSearch, $options: 'i' } },
      ]
    }

    if (active !== null && active !== '') {
      query.isActive = active === 'true'
    }

    const clients = await Client.find(query).sort({ createdAt: -1 })

    return NextResponse.json(clients)
  } catch (error: any) {
    console.error('Get clients error:', error)
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

    if (session.user.role !== 'admin' && !session.user.permissions?.clients?.create) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    await connectDB()

    // Check for unique name
    const existingName = await Client.findOne({ name: body.name })
    if (existingName) {
      return NextResponse.json(
        { error: 'A client with this name already exists' },
        { status: 400 }
      )
    }

    // Check for unique ICE if provided
    if (body.ice) {
      const existingIce = await Client.findOne({ ice: body.ice })
      if (existingIce) {
        return NextResponse.json(
          { error: 'A client with this ICE already exists' },
          { status: 400 }
        )
      }
    }

    const { name, ice, contactPerson, address, city, country, phone, email, notes, isActive } = body
    const client = await Client.create({
      name, ice, contactPerson, address, city, country, phone, email, notes, isActive,
      createdBy: session.user.id,
    })

    // Log activity
    await logActivity(
      'client_created',
      session.user.id,
      `Created client: ${client.name}`,
      { entityType: 'client', entityId: client._id }
    )

    return NextResponse.json(client, { status: 201 })
  } catch (error: any) {
    console.error('Create client error:', error)

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      return NextResponse.json(
        { error: `A client with this ${field} already exists` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
