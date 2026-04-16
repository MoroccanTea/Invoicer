import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db/mongoose'
import Client from '@/lib/models/Client'
import Project from '@/lib/models/Project'
import Invoice from '@/lib/models/Invoice'
import { logActivity } from '@/lib/models/ActivityLog'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin' && !session.user.permissions?.clients?.view) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()

    const client = await Client.findById(id)

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error: any) {
    console.error('Get client error:', error)
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
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin' && !session.user.permissions?.clients?.edit) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    await connectDB()

    const client = await Client.findById(id)

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Check for unique name if changed
    if (body.name && body.name !== client.name) {
      const existingName = await Client.findOne({ name: body.name })
      if (existingName) {
        return NextResponse.json(
          { error: 'A client with this name already exists' },
          { status: 400 }
        )
      }
    }

    // Check for unique ICE if changed
    if (body.ice && body.ice !== client.ice) {
      const existingIce = await Client.findOne({ ice: body.ice })
      if (existingIce) {
        return NextResponse.json(
          { error: 'A client with this ICE already exists' },
          { status: 400 }
        )
      }
    }

    Object.assign(client, body)
    await client.save()

    // Log activity
    await logActivity(
      'client_updated',
      session.user.id,
      `Updated client: ${client.name}`,
      { entityType: 'client', entityId: client._id }
    )

    return NextResponse.json(client)
  } catch (error: any) {
    console.error('Update client error:', error)

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin' && !session.user.permissions?.clients?.delete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()

    const client = await Client.findById(id)

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Check for related projects
    const projectCount = await Project.countDocuments({ client: id })
    if (projectCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete client with ${projectCount} associated project(s)` },
        { status: 400 }
      )
    }

    // Check for related invoices
    const invoiceCount = await Invoice.countDocuments({ client: id })
    if (invoiceCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete client with ${invoiceCount} associated invoice(s)` },
        { status: 400 }
      )
    }

    await client.deleteOne()

    // Log activity
    await logActivity(
      'client_deleted',
      session.user.id,
      `Deleted client: ${client.name}`,
      { entityType: 'client', entityId: client._id }
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete client error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
