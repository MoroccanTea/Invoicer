// Shared styles injected into every template
const base = (content: string, title: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #111827; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #1d4ed8; padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
    .header p { margin: 6px 0 0; color: #bfdbfe; font-size: 13px; }
    .body { padding: 36px 40px; }
    .body h2 { margin: 0 0 16px; font-size: 18px; color: #111827; }
    .body p { margin: 0 0 14px; font-size: 14px; line-height: 1.6; color: #374151; }
    .info-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 20px; margin: 20px 0; }
    .info-box table { width: 100%; border-collapse: collapse; }
    .info-box td { padding: 5px 0; font-size: 13px; color: #374151; }
    .info-box td:first-child { color: #6b7280; width: 140px; }
    .info-box td:last-child { font-weight: 600; text-align: right; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 600; }
    .badge-pending { background: #fef3c7; color: #92400e; }
    .badge-overdue { background: #fee2e2; color: #991b1b; }
    .badge-paid { background: #d1fae5; color: #065f46; }
    .btn { display: inline-block; margin: 20px 0 8px; padding: 12px 28px; background: #1d4ed8; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; }
    .footer { padding: 20px 40px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Invoicer</h1>
      <p>Professional Billing Management</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      This email was sent automatically by Invoicer. Please do not reply to this message.
    </div>
  </div>
</body>
</html>
`

export interface InvoiceEmailData {
  invoiceNumber: string
  clientName: string
  total: number
  currencySymbol: string
  issueDate: string
  dueDate: string
  businessName: string
  invoiceUrl?: string
}

export function invoiceCreatedTemplate(data: InvoiceEmailData): string {
  return base(`
    <h2>New Invoice Created</h2>
    <p>Hi ${data.clientName},</p>
    <p>A new invoice has been issued by <strong>${data.businessName}</strong>. Please find the details below:</p>
    <div class="info-box">
      <table>
        <tr><td>Invoice Number</td><td>${data.invoiceNumber}</td></tr>
        <tr><td>Issue Date</td><td>${data.issueDate}</td></tr>
        <tr><td>Due Date</td><td>${data.dueDate}</td></tr>
        <tr><td>Amount Due</td><td>${data.total.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${data.currencySymbol}</td></tr>
      </table>
    </div>
    ${data.invoiceUrl ? `<a class="btn" href="${data.invoiceUrl}">View Invoice</a>` : ''}
    <p style="font-size:13px;color:#6b7280;">If you have any questions about this invoice, please contact us directly.</p>
  `, `Invoice ${data.invoiceNumber}`)
}

export function paymentReminderTemplate(data: InvoiceEmailData & { daysOverdue: number }): string {
  const isOverdue = data.daysOverdue > 0
  const badge = isOverdue
    ? `<span class="badge badge-overdue">${data.daysOverdue} day${data.daysOverdue !== 1 ? 's' : ''} overdue</span>`
    : `<span class="badge badge-pending">Due ${data.dueDate}</span>`

  return base(`
    <h2>Payment Reminder ${badge}</h2>
    <p>Hi ${data.clientName},</p>
    <p>
      ${isOverdue
        ? `This is a friendly reminder that invoice <strong>${data.invoiceNumber}</strong> from <strong>${data.businessName}</strong> is now <strong>${data.daysOverdue} day${data.daysOverdue !== 1 ? 's' : ''} overdue</strong>.`
        : `This is a reminder that invoice <strong>${data.invoiceNumber}</strong> from <strong>${data.businessName}</strong> is due on <strong>${data.dueDate}</strong>.`
      }
    </p>
    <div class="info-box">
      <table>
        <tr><td>Invoice Number</td><td>${data.invoiceNumber}</td></tr>
        <tr><td>Due Date</td><td>${data.dueDate}</td></tr>
        <tr><td>Amount Due</td><td>${data.total.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${data.currencySymbol}</td></tr>
      </table>
    </div>
    ${data.invoiceUrl ? `<a class="btn" href="${data.invoiceUrl}">View Invoice</a>` : ''}
    <p style="font-size:13px;color:#6b7280;">If you have already settled this payment, please disregard this message.</p>
  `, `Payment Reminder — ${data.invoiceNumber}`)
}

export interface TaxReminderEmailData {
  firstName: string
  quarter: string
  year: number
  deadlineDate: string
}

export function taxReminderTemplate(data: TaxReminderEmailData): string {
  return base(`
    <h2>Tax Payment Reminder — ${data.quarter} ${data.year}</h2>
    <p>Hi ${data.firstName},</p>
    <p>
      This is your quarterly tax payment reminder. Your <strong>${data.quarter} ${data.year}</strong> tax
      declaration and payment is due by <strong>${data.deadlineDate}</strong>.
    </p>
    <div class="info-box">
      <table>
        <tr><td>Period</td><td>${data.quarter} ${data.year}</td></tr>
        <tr><td>Deadline</td><td>${data.deadlineDate}</td></tr>
      </table>
    </div>
    <p>Please review your invoices for this quarter and prepare your declaration in time.</p>
    <p style="font-size:13px;color:#6b7280;">
      This reminder was sent because you have tax reminders enabled in your profile settings.
      You can disable them at any time from your profile page.
    </p>
  `, `Tax Reminder — ${data.quarter} ${data.year}`)
}

export interface TwoFACodeEmailData {
  firstName: string
  backupCodes: string[]
}

export function twoFABackupCodesTemplate(data: TwoFACodeEmailData): string {
  const codeRows = data.backupCodes
    .map(c => `<tr><td style="font-family:monospace;font-size:15px;letter-spacing:2px;padding:4px 0;">${c}</td></tr>`)
    .join('')

  return base(`
    <h2>Your 2FA Backup Codes</h2>
    <p>Hi ${data.firstName},</p>
    <p>
      Two-factor authentication has been <strong>enabled</strong> on your account.
      Below are your one-time backup codes. Each code can only be used once.
    </p>
    <div class="info-box">
      <p style="margin:0 0 12px;font-size:13px;color:#6b7280;">Store these codes somewhere safe.</p>
      <table>${codeRows}</table>
    </div>
    <p style="font-size:13px;color:#6b7280;">
      If you did not enable 2FA on your account, please contact your administrator immediately.
    </p>
  `, '2FA Backup Codes')
}
