import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { redirect, notFound } from 'next/navigation'
import connectDB from '@/lib/db/mongoose'
import Invoice from '@/lib/models/Invoice'
import Config from '@/lib/models/Config'
import InvoiceDetailClient from './InvoiceDetailClient'

async function getData(id: string) {
  await connectDB()

  const [invoice, config] = await Promise.all([
    Invoice.findById(id)
      .populate('project', 'name')
      .populate('client', 'name ice address city country phone email')
      .lean(),
    Config.findOne().lean(),
  ])

  if (!invoice) {
    return null
  }

  return {
    invoice: {
      ...invoice,
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
    },
    config: config
      ? {
          businessName: config.businessName,
          businessAddress: config.businessAddress,
          businessCity: config.businessCity,
          businessCountry: config.businessCountry,
          businessPhone: config.businessPhone,
          businessEmail: config.businessEmail,
          ice: config.ice,
          identifiantFiscal: config.identifiantFiscal,
          taxeProfessionnelle: config.taxeProfessionnelle,
          rc: config.rc,
          bankName: config.bankName,
          rib: config.rib,
          iban: config.iban,
          currency: config.currency,
          currencySymbol: config.currencySymbol,
          taxRate: config.taxRate,
          taxName: config.taxName,
          logo: config.logo,
          digitalSignature: config.digitalSignature,
          digitalStamp: config.digitalStamp,
          invoiceFooterText: config.invoiceFooterText,
          termsAndConditions: config.termsAndConditions,
        }
      : null,
  }
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (
    !session?.user?.permissions?.invoices?.view &&
    session?.user?.role !== 'admin'
  ) {
    redirect('/dashboard')
  }

  const data = await getData(id)

  if (!data) {
    notFound()
  }

  return (
    <InvoiceDetailClient
      invoice={data.invoice}
      config={data.config}
      canExport={
        session?.user?.permissions?.invoices?.export ||
        session?.user?.role === 'admin'
      }
    />
  )
}
