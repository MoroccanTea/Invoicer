import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db/mongoose'
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

    if (session.user.role !== 'admin' && !session.user.permissions?.invoices?.view) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()

    const invoice = await Invoice.findById(id)
      .populate('project', 'name')
      .populate('client', 'name ice address city country phone email')

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Format for client
    const result = {
      ...invoice.toObject(),
      _id: invoice._id.toString(),
      project: invoice.project
        ? {
            _id: (invoice.project as any)._id.toString(),
            name: (invoice.project as any).name,
          }
        : null,
      client: invoice.client
        ? {
            _id: (invoice.client as any)._id.toString(),
            name: (invoice.client as any).name,
            ice: (invoice.client as any).ice,
            address: (invoice.client as any).address,
            city: (invoice.client as any).city,
            country: (invoice.client as any).country,
            phone: (invoice.client as any).phone,
            email: (invoice.client as any).email,
          }
        : null,
      createdBy: invoice.createdBy.toString(),
      issueDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      paidDate: invoice.paidDate?.toISOString() || null,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Get invoice error:', error)
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

    if (session.user.role !== 'admin' && !session.user.permissions?.invoices?.edit) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    await connectDB()

    const invoice = await Invoice.findById(id)

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const oldStatus = invoice.status

    // Update allowed fields
    const allowedFields = [
      'status',
      'items',
      'subtotal',
      'taxRate',
      'taxAmount',
      'total',
      'dueDate',
      'notes',
      'termsAndConditions',
      'billingType',
    ]

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        (invoice as any)[field] = body[field]
      }
    })

    // Set paidDate when status changes to paid
    if (
      body.status &&
      (body.status === 'paid_pending_taxes' || body.status === 'all_paid') &&
      oldStatus !== 'paid_pending_taxes' &&
      oldStatus !== 'all_paid'
    ) {
      invoice.paidDate = new Date()
    }

    await invoice.save()

    // Log activity
    if (body.status && body.status !== oldStatus) {
      const activityType =
        body.status === 'paid_pending_taxes' || body.status === 'all_paid'
          ? 'invoice_paid'
          : body.status === 'cancelled'
          ? 'invoice_cancelled'
          : 'invoice_updated'

      await logActivity(
        activityType,
        session.user.id,
        `Updated invoice ${invoice.invoiceNumber} status to ${body.status}`,
        { entityType: 'invoice', entityId: invoice._id }
      )
    } else {
      await logActivity(
        'invoice_updated',
        session.user.id,
        `Updated invoice: ${invoice.invoiceNumber}`,
        { entityType: 'invoice', entityId: invoice._id }
      )
    }

    return NextResponse.json(invoice)
  } catch (error: any) {
    console.error('Update invoice error:', error)
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

    if (session.user.role !== 'admin' && !session.user.permissions?.invoices?.delete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()

    const invoice = await Invoice.findById(id)

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    await invoice.deleteOne()

    // Log activity
    await logActivity(
      'invoice_deleted',
      session.user.id,
      `Deleted invoice: ${invoice.invoiceNumber}`,
      { entityType: 'invoice', entityId: invoice._id }
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete invoice error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
