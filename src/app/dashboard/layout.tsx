import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  if (session.user.mustChangePassword) {
    redirect('/change-password')
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
