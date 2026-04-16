import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db/mongoose'
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

    if (session.user.role !== 'admin' && !session.user.permissions?.projects?.view) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()

    const project = await Project.findById(id).populate('client', 'name ice')

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Format for client
    const result = {
      ...project.toObject(),
      _id: project._id.toString(),
      client: project.client
        ? {
            _id: (project.client as any)._id.toString(),
            name: (project.client as any).name,
            ice: (project.client as any).ice,
          }
        : null,
      createdBy: project.createdBy.toString(),
      startDate: project.startDate.toISOString(),
      endDate: project.endDate?.toISOString() || null,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Get project error:', error)
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

    if (session.user.role !== 'admin' && !session.user.permissions?.projects?.edit) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    await connectDB()

    const project = await Project.findById(id)

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const oldStatus = project.status

    Object.assign(project, body)
    await project.save()

    // Log status changes
    if (body.status && body.status !== oldStatus) {
      const activityType =
        body.status === 'completed'
          ? 'project_completed'
          : body.status === 'cancelled'
          ? 'project_cancelled'
          : 'project_updated'

      await logActivity(
        activityType,
        session.user.id,
        `Updated project "${project.name}" status to ${body.status}`,
        { entityType: 'project', entityId: project._id }
      )
    } else {
      await logActivity(
        'project_updated',
        session.user.id,
        `Updated project: ${project.name}`,
        { entityType: 'project', entityId: project._id }
      )
    }

    return NextResponse.json(project)
  } catch (error: any) {
    console.error('Update project error:', error)
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

    if (session.user.role !== 'admin' && !session.user.permissions?.projects?.delete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()

    const project = await Project.findById(id)

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check for related invoices
    const invoiceCount = await Invoice.countDocuments({ project: id })
    if (invoiceCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete project with ${invoiceCount} associated invoice(s)` },
        { status: 400 }
      )
    }

    await project.deleteOne()

    // Log activity
    await logActivity(
      'project_deleted',
      session.user.id,
      `Deleted project: ${project.name}`,
      { entityType: 'project', entityId: project._id }
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
