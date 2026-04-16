import nodemailer, { Transporter } from 'nodemailer'

let transporter: Transporter | null = null

function getTransporter(): Transporter {
  if (transporter) return transporter

  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    throw new Error('SMTP configuration is incomplete. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.')
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  return transporter
}

export interface SendMailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendMail(options: SendMailOptions): Promise<void> {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER
  const t = getTransporter()
  await t.sendMail({ from, ...options })
}

export function isEmailConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}
