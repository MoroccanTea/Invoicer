import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db/mongoose'
import Project from '@/lib/models/Project'
import { logActivity } from '@/lib/models/ActivityLog'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin' && !session.user.permissions?.projects?.view) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const client = searchParams.get('client')

    let query: any = {}

    if (status && status !== 'all') {
      query.status = status
    }

    if (client) {
      query.client = client
    }

    const projects = await Project.find(query)
      .populate('client', 'name ice')
      .sort({ createdAt: -1 })

    return NextResponse.json(projects)
  } catch (error: any) {
    console.error('Get projects error:', error)
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

    if (session.user.role !== 'admin' && !session.user.permissions?.projects?.create) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    await connectDB()

    const project = await Project.create({
      ...body,
      createdBy: session.user.id,
    })

    // Log activity
    await logActivity(
      'project_created',
      session.user.id,
      `Created project: ${project.name}`,
      { entityType: 'project', entityId: project._id }
    )

    return NextResponse.json(project, { status: 201 })
  } catch (error: any) {
    console.error('Create project error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
