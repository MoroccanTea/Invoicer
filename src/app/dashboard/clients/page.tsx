import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import connectDB from '@/lib/db/mongoose'
import Client from '@/lib/models/Client'
import ClientsClient from './ClientsClient'

async function getClients() {
  await connectDB()
  const clients = await Client.find()
    .sort({ createdAt: -1 })
    .lean()

  return clients.map((client) => ({
    ...client,
    _id: client._id.toString(),
    createdBy: client.createdBy.toString(),
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
  }))
}

export default async function ClientsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.permissions?.clients?.view && session?.user?.role !== 'admin') {
    redirect('/dashboard')
  }

  const clients = await getClients()

  return (
    <ClientsClient
      initialClients={clients}
      permissions={session?.user?.permissions?.clients || {
        view: true,
        create: false,
        edit: false,
        delete: false,
      }}
    />
  )
}
