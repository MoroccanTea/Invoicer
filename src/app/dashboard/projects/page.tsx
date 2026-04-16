import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import connectDB from '@/lib/db/mongoose'
import Project from '@/lib/models/Project'
import Client from '@/lib/models/Client'
import ProjectsClient from './ProjectsClient'

async function getData() {
  await connectDB()

  const [projects, clients] = await Promise.all([
    Project.find()
      .populate('client', 'name ice')
      .sort({ createdAt: -1 })
      .lean(),
    Client.find({ isActive: true }).select('name ice').sort({ name: 1 }).lean(),
  ])

  return {
    projects: projects.map((project) => ({
      ...project,
      _id: project._id.toString(),
      client: project.client
        ? {
            _id: (project.client as any)._id.toString(),
            name: (project.client as any).name,
            ice: (project.client as any).ice,
          }
        : null,
      createdBy: project.createdBy.toString(),
      startDate: project.startDate.toISOString(),
      endDate: project.endDate?.toISOString() || null,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    })),
    clients: clients.map((client) => ({
      _id: client._id.toString(),
      name: client.name,
      ice: client.ice,
    })),
  }
}

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.permissions?.projects?.view && session?.user?.role !== 'admin') {
    redirect('/dashboard')
  }

  const { projects, clients } = await getData()

  return (
    <ProjectsClient
      initialProjects={projects}
      clients={clients}
      permissions={session?.user?.permissions?.projects || {
        view: true,
        create: false,
        edit: false,
        delete: false,
      }}
    />
  )
}
