import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import connectDB from '@/lib/db/mongoose'
import Invoice from '@/lib/models/Invoice'
import Project from '@/lib/models/Project'
import Config from '@/lib/models/Config'
import InvoicesClient from './InvoicesClient'

async function getData() {
  await connectDB()

  const [invoices, projects, config] = await Promise.all([
    Invoice.find()
      .populate('project', 'name')
      .populate('client', 'name ice')
      .sort({ createdAt: -1 })
      .lean(),
    Project.find({ status: 'active' })
      .populate('client', 'name ice')
      .select('name client')
      .sort({ name: 1 })
      .lean(),
    Config.findOne().lean(),
  ])

  return {
    invoices: invoices.map((invoice) => ({
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
          }
        : null,
      createdBy: invoice.createdBy.toString(),
      issueDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      paidDate: invoice.paidDate?.toISOString() || null,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
    })),
    projects: projects.map((project) => ({
      _id: project._id.toString(),
      name: project.name,
      client: project.client
        ? {
            _id: (project.client as any)._id.toString(),
            name: (project.client as any).name,
            ice: (project.client as any).ice,
          }
        : null,
    })),
    config: config
      ? {
          taxRate: config.taxRate,
          taxName: config.taxName,
          currency: config.currency,
          currencySymbol: config.currencySymbol,
          defaultPaymentTerms: config.defaultPaymentTerms,
        }
      : {
          taxRate: 20,
          taxName: 'TVA',
          currency: 'MAD',
          currencySymbol: 'DH',
          defaultPaymentTerms: 30,
        },
  }
}

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.permissions?.invoices?.view && session?.user?.role !== 'admin') {
    redirect('/dashboard')
  }

  const { invoices, projects, config } = await getData()

  return (
    <InvoicesClient
      initialInvoices={invoices}
      projects={projects}
      config={config}
      permissions={session?.user?.permissions?.invoices || {
        view: true,
        create: false,
        edit: false,
        delete: false,
        export: false,
      }}
    />
  )
}
