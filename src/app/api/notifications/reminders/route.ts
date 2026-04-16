import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db/mongoose'
import Invoice from '@/lib/models/Invoice'
import User from '@/lib/models/User'
import Config from '@/lib/models/Config'
import { sendMail, isEmailConfigured } from '@/lib/email/mailer'
import { paymentReminderTemplate, taxReminderTemplate } from '@/lib/email/templates'
import { differenceInDays, format, getMonth } from 'date-fns'

/**
 * @openapi
 * /api/notifications/reminders:
 *   post:
 *     summary: Process and send all pending reminders (overdue invoices + tax reminders)
 *     description: >
 *       Sends payment reminders for overdue invoices (where client has notificationsEnabled)
 *       and quarterly tax reminders to users who opted in. Can be triggered by an external
 *       cron job using the CRON_SECRET header for authentication.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *       - cronSecret: []
 *     responses:
 *       200:
 *         description: Summary of sent reminders
 *       400:
 *         description: SMTP not configured
 *       401:
 *         description: Unauthorized
 */
export async function POST(request: NextRequest) {
  // Allow either an authenticated admin session or a cron secret header
  const cronSecret = request.headers.get('x-cron-secret')
  const isCron = cronSecret && cronSecret === process.env.CRON_SECRET

  if (!isCron) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  if (!isEmailConfigured()) {
    return NextResponse.json({ error: 'Email is not configured on this server' }, { status: 400 })
  }

  await connectDB()

  const [config, overdueInvoices, usersWithTaxReminder] = await Promise.all([
    Config.findOne().lean(),
    Invoice.find({
      status: { $in: ['pending', 'paid_pending_taxes'] },
      dueDate: { $lt: new Date() },
    })
      .populate('client', 'name email notificationsEnabled')
      .lean(),
    User.find({ taxReminderEnabled: true, isActive: true }).lean(),
  ])

  const results = { invoiceReminders: 0, taxReminders: 0, errors: 0 }
  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  // Invoice payment reminders
  for (const invoice of overdueInvoices) {
    const client = invoice.client as any
    if (!client?.email || !client?.notificationsEnabled) continue

    try {
      const daysOverdue = differenceInDays(new Date(), new Date(invoice.dueDate))
      await sendMail({
        to: client.email,
        subject: `Payment Reminder — Invoice ${invoice.invoiceNumber}`,
        html: paymentReminderTemplate({
          invoiceNumber: invoice.invoiceNumber,
          clientName: client.name,
          total: invoice.total,
          currencySymbol: config?.currencySymbol || 'DH',
          issueDate: format(new Date(invoice.issueDate), 'dd/MM/yyyy'),
          dueDate: format(new Date(invoice.dueDate), 'dd/MM/yyyy'),
          businessName: config?.businessName || 'Your Business',
          invoiceUrl: `${appUrl}/dashboard/invoices/${invoice._id}`,
          daysOverdue: Math.max(0, daysOverdue),
        }),
      })
      results.invoiceReminders++
    } catch {
      results.errors++
    }
  }

  // Quarterly tax reminders — sent if today is in the first 3 days of Jan/Apr/Jul/Oct
  const now = new Date()
  const month = getMonth(now) // 0-indexed
  const day = now.getDate()
  const taxMonths = [0, 3, 6, 9] // Jan=0, Apr=3, Jul=6, Oct=9

  if (taxMonths.includes(month) && day <= 3) {
    const quarterNames: Record<number, string> = {
      0: 'Q1', 3: 'Q2', 6: 'Q3', 9: 'Q4',
    }
    const quarter = quarterNames[month]
    const year = now.getFullYear()
    // Deadline is last day of the month for Moroccan tax
    const deadlineDate = format(new Date(year, month + 1, 0), 'dd/MM/yyyy')

    for (const user of usersWithTaxReminder) {
      if (!user.email) continue
      try {
        await sendMail({
          to: user.email,
          subject: `Tax Payment Reminder — ${quarter} ${year}`,
          html: taxReminderTemplate({ firstName: user.firstName, quarter, year, deadlineDate }),
        })
        results.taxReminders++
      } catch {
        results.errors++
      }
    }
  }

  return NextResponse.json({
    message: 'Reminders processed',
    ...results,
  })
}
