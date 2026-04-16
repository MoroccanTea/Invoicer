'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiFolder,
  FiCalendar,
  FiUser,
  FiFilter,
} from 'react-icons/fi'

type ProjectStatus = 'active' | 'completed' | 'cancelled' | 'on_hold'

interface ProjectData {
  _id: string
  name: string
  description?: string
  client: { _id: string; name: string; ice?: string } | null
  status: ProjectStatus
  startDate: string
  endDate: string | null
  budget?: number
  notes?: string
  createdAt: string
}

interface ClientOption {
  _id: string
  name: string
  ice?: string
}

interface Permissions {
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
}

interface Props {
  initialProjects: ProjectData[]
  clients: ClientOption[]
  permissions: Permissions
}

const STATUS_CONFIG: Record<ProjectStatus, { label: string; class: string }> = {
  active: { label: 'Active', class: 'status-active' },
  completed: { label: 'Completed', class: 'status-completed' },
  cancelled: { label: 'Cancelled', class: 'status-cancelled' },
  on_hold: { label: 'On Hold', class: 'status-on-hold' },
}

export default function ProjectsClient({ initialProjects, clients, permissions }: Props) {
  const [projects, setProjects] = useState(initialProjects)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const router = useRouter()

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleCreate = () => {
    setEditingProject(null)
    setShowModal(true)
  }

  const handleEdit = (project: ProjectData) => {
    setEditingProject(project)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete project')
      }

      setProjects(projects.filter((p) => p._id !== id))
      toast.success('Project deleted successfully')
      setDeleteConfirm(null)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleStatusChange = async (id: string, status: ProjectStatus) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update status')
      }

      setProjects(projects.map((p) => (p._id === id ? { ...p, ...result } : p)))
      toast.success('Status updated')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleSave = async (data: any) => {
    try {
      const url = editingProject
        ? `/api/projects/${editingProject._id}`
        : '/api/projects'
      const method = editingProject ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save project')
      }

      // Refetch to get populated client
      const fullProject = await fetch(`/api/projects/${result._id}`).then((r) => r.json())

      if (editingProject) {
        setProjects(projects.map((p) => (p._id === editingProject._id ? fullProject : p)))
      } else {
        setProjects([fullProject, ...projects])
      }

      toast.success(editingProject ? 'Project updated' : 'Project created')
      setShowModal(false)
      setEditingProject(null)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your client projects
          </p>
        </div>

        {permissions.create && (
          <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
            <FiPlus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects or clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <div className="relative">
          <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
            className="input-field pl-10 pr-8"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      {filteredProjects.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="table-header">Project</th>
                  <th className="table-header">Client</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Start Date</th>
                  <th className="table-header">End Date</th>
                  {(permissions.edit || permissions.delete) && (
                    <th className="table-header text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProjects.map((project) => (
                  <tr key={project._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <FiFolder className="w-4 h-4 text-primary-700 dark:text-primary-400" />
                        </div>
                        <div>
                          <p className="font-medium">{project.name}</p>
                          {project.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      {project.client ? (
                        <div className="flex items-center gap-2">
                          <FiUser className="w-4 h-4 text-gray-400" />
                          <span>{project.client.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {permissions.edit ? (
                        <select
                          value={project.status}
                          onChange={(e) =>
                            handleStatusChange(project._id, e.target.value as ProjectStatus)
                          }
                          className={`status-badge ${STATUS_CONFIG[project.status].class} border-0 cursor-pointer`}
                        >
                          {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                            <option key={value} value={value}>
                              {config.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`status-badge ${STATUS_CONFIG[project.status].class}`}>
                          {STATUS_CONFIG[project.status].label}
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-4 h-4 text-gray-400" />
                        {format(new Date(project.startDate), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="table-cell">
                      {project.endDate ? (
                        format(new Date(project.endDate), 'MMM d, yyyy')
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    {(permissions.edit || permissions.delete) && (
                      <td className="table-cell text-right">
                        <div className="flex justify-end gap-2">
                          {permissions.edit && (
                            <button
                              onClick={() => handleEdit(project)}
                              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                          )}
                          {permissions.delete && (
                            <button
                              onClick={() => setDeleteConfirm(project._id)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <FiFolder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No projects found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first project'}
          </p>
          {permissions.create && !searchTerm && statusFilter === 'all' && (
            <button onClick={handleCreate} className="btn-primary">
              Create Project
            </button>
          )}
        </div>
      )}

      {/* Project Modal */}
      {showModal && (
        <ProjectModal
          project={editingProject}
          clients={clients}
          onClose={() => {
            setShowModal(false)
            setEditingProject(null)
          }}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete Project
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure? This will also affect related invoices.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger flex-1">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface ProjectModalProps {
  project: ProjectData | null
  clients: ClientOption[]
  onClose: () => void
  onSave: (data: any) => void
}

function ProjectModal({ project, clients, onClose, onSave }: ProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [clientSearch, setClientSearch] = useState('')
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    client: project?.client?._id || '',
    clientName: project?.client?.name || '',
    status: project?.status || 'active',
    startDate: project?.startDate
      ? format(new Date(project.startDate), 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd'),
    endDate: project?.endDate ? format(new Date(project.endDate), 'yyyy-MM-dd') : '',
    budget: project?.budget || '',
    notes: project?.notes || '',
  })

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.ice?.includes(clientSearch)
  )

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleClientSelect = (client: ClientOption) => {
    setFormData((prev) => ({
      ...prev,
      client: client._id,
      clientName: client.name,
    }))
    setClientSearch('')
    setShowClientDropdown(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await onSave({
      ...formData,
      budget: formData.budget ? Number(formData.budget) : undefined,
      endDate: formData.endDate || undefined,
    })
    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {project ? 'Edit Project' : 'New Project'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Project Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              rows={3}
            />
          </div>

          <div className="relative">
            <label className="label">Client *</label>
            <input
              type="text"
              value={formData.clientName || clientSearch}
              onChange={(e) => {
                setClientSearch(e.target.value)
                setFormData((prev) => ({ ...prev, client: '', clientName: '' }))
                setShowClientDropdown(true)
              }}
              onFocus={() => setShowClientDropdown(true)}
              className="input-field"
              placeholder="Search by name or ICE..."
              required
            />
            {showClientDropdown && filteredClients.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredClients.map((client) => (
                  <button
                    key={client._id}
                    type="button"
                    onClick={() => handleClientSelect(client)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">
                      {client.name}
                    </p>
                    {client.ice && (
                      <p className="text-xs text-gray-500">ICE: {client.ice}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="label">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field"
            >
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="label">Budget</label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className="input-field"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="input-field"
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.client}
              className="btn-primary flex-1"
            >
              {isLoading ? 'Saving...' : project ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
