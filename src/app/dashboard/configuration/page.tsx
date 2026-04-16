import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import connectDB from '@/lib/db/mongoose'
import Config from '@/lib/models/Config'
import ConfigurationClient from './ConfigurationClient'

async function getConfig() {
  await connectDB()

  // Use the static method which handles creation with proper defaults
  const config = await (Config as any).getConfig()

  return {
    ...config.toObject(),
    _id: config._id.toString(),
    createdAt: config.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: config.updatedAt?.toISOString() || new Date().toISOString(),
  }
}

export default async function ConfigurationPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.permissions?.configuration?.view && session?.user?.role !== 'admin') {
    redirect('/dashboard')
  }

  const config = await getConfig()

  return <ConfigurationClient initialConfig={config} canEdit={session?.user?.permissions?.configuration?.edit || session?.user?.role === 'admin'} />
}
