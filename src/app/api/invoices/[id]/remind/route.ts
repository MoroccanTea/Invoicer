import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db/mongoose'
import Invoice from '@/lib/models/Invoice'
import Config from '@/lib/models/Config'
import { isValidObjectId, invalidIdResponse } from '@/lib/utils/objectId'
import { sendMail, isEmailConfigured } from '@/lib/email/mailer'
import { paymentReminderTemplate } from '@/lib/email/templates'
import { differenceInDays, format } from 'date-fns'

/**
 * @openapi
 * /api/invoices/{id}/remind:
 *   post:
 *     summary: Send a payment reminder email for an invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reminder sent
 *       400:
 *         description: SMTP not configured or invoice already paid
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Invoice not found
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!isValidObjectId(id)) return invalidIdResponse()

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role !== 'admin' && !session.user.permissions?.invoices?.edit) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!isEmailConfigured()) {
    return NextResponse.json({ error: 'Email is not configured on this server' }, { status: 400 })
  }

  await connectDB()

  const [invoice, config] = await Promise.all([
    Invoice.findById(id)
      .populate('client', 'name email')
      .lean(),
    Config.findOne().lean(),
  ])

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  if (invoice.status === 'all_paid') {
    return NextResponse.json({ error: 'Invoice is already fully paid' }, { status: 400 })
  }

  const client = invoice.client as any

  if (!client?.email) {
    return NextResponse.json({ error: 'Client has no email address' }, { status: 400 })
  }

  const dueDate = new Date(invoice.dueDate)
  const daysOverdue = differenceInDays(new Date(), dueDate)
  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  await sendMail({
    to: client.email,
    subject: `Payment Reminder — Invoice ${invoice.invoiceNumber}`,
    html: paymentReminderTemplate({
      invoiceNumber: invoice.invoiceNumber,
      clientName: client.name,
      total: invoice.total,
      currencySymbol: config?.currencySymbol || 'DH',
      issueDate: format(new Date(invoice.issueDate), 'dd/MM/yyyy'),
      dueDate: format(dueDate, 'dd/MM/yyyy'),
      businessName: config?.businessName || 'Your Business',
      invoiceUrl: `${appUrl}/dashboard/invoices/${id}`,
      daysOverdue: Math.max(0, daysOverdue),
    }),
  })

  return NextResponse.json({ message: 'Reminder sent successfully' })
}
