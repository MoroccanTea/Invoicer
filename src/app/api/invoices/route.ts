import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db/mongoose'
import Invoice from '@/lib/models/Invoice'
import { getNextInvoiceNumber } from '@/lib/models/Counter'
import { logActivity } from '@/lib/models/ActivityLog'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin' && !session.user.permissions?.invoices?.view) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const project = searchParams.get('project')
    const client = searchParams.get('client')

    let query: any = {}

    if (status && status !== 'all') {
      query.status = status
    }

    if (project) {
      query.project = project
    }

    if (client) {
      query.client = client
    }

    const invoices = await Invoice.find(query)
      .populate('project', 'name')
      .populate('client', 'name ice')
      .sort({ createdAt: -1 })

    return NextResponse.json(invoices)
  } catch (error: any) {
    console.error('Get invoices error:', error)
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

    if (session.user.role !== 'admin' && !session.user.permissions?.invoices?.create) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    await connectDB()

    // Generate unique invoice number
    const issueDate = new Date(body.issueDate)
    const invoiceNumber = await getNextInvoiceNumber(body.category, issueDate)

    const invoice = await Invoice.create({
      ...body,
      invoiceNumber,
      createdBy: session.user.id,
    })

    // Log activity
    await logActivity(
      'invoice_created',
      session.user.id,
      `Created invoice: ${invoiceNumber}`,
      { entityType: 'invoice', entityId: invoice._id }
    )

    return NextResponse.json(invoice, { status: 201 })
  } catch (error: any) {
    console.error('Create invoice error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
