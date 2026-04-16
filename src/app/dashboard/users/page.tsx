import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import connectDB from '@/lib/db/mongoose'
import User from '@/lib/models/User'
import UsersClient from './UsersClient'

async function getUsers() {
  await connectDB()
  const users = await User.find()
    .select('-password')
    .sort({ createdAt: -1 })
    .lean()

  return users.map((user) => ({
    ...user,
    _id: user._id.toString(),
    lastLogin: user.lastLogin?.toISOString() || null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }))
}

export default async function UsersPage() {
  const session = await getServerSession(authOptions)

  if (
    !session?.user?.permissions?.users?.view &&
    session?.user?.role !== 'admin'
  ) {
    redirect('/dashboard')
  }

  const users = await getUsers()

  return (
    <UsersClient
      initialUsers={users}
      currentUserId={session.user.id}
      permissions={
        session?.user?.permissions?.users || {
          view: true,
          create: false,
          edit: false,
          delete: false,
        }
      }
    />
  )
}
