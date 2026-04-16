'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiMail,
  FiPhone,
  FiMapPin,
} from 'react-icons/fi'

interface ClientData {
  _id: string
  name: string
  ice?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country: string
  postalCode?: string
  contactPerson?: string
  contactEmail?: string
  contactPhone?: string
  notes?: string
  isActive: boolean
  createdAt: string
}

interface Permissions {
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
}

interface Props {
  initialClients: ClientData[]
  permissions: Permissions
}

export default function ClientsClient({ initialClients, permissions }: Props) {
  const [clients, setClients] = useState(initialClients)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientData | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const router = useRouter()

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.ice?.includes(searchTerm) ||
      client.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = () => {
    setEditingClient(null)
    setShowModal(true)
  }

  const handleEdit = (client: ClientData) => {
    setEditingClient(client)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete client')
      }

      setClients(clients.filter((c) => c._id !== id))
      toast.success('Client deleted successfully')
      setDeleteConfirm(null)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleSave = async (data: Partial<ClientData>) => {
    try {
      const url = editingClient
        ? `/api/clients/${editingClient._id}`
        : '/api/clients'
      const method = editingClient ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save client')
      }

      if (editingClient) {
        setClients(clients.map((c) => (c._id === editingClient._id ? result : c)))
      } else {
        setClients([result, ...clients])
      }

      toast.success(editingClient ? 'Client updated' : 'Client created')
      setShowModal(false)
      setEditingClient(null)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Clients
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your client database
          </p>
        </div>

        {permissions.create && (
          <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
            <FiPlus className="w-4 h-4" />
            Add Client
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, ICE, or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Clients Grid */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <div key={client._id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <FiUsers className="w-5 h-5 text-primary-700 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {client.name}
                    </h3>
                    {client.ice && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ICE: {client.ice}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={`status-badge ${
                    client.isActive ? 'status-active' : 'status-cancelled'
                  }`}
                >
                  {client.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {client.email && (
                  <div className="flex items-center gap-2">
                    <FiMail className="w-4 h-4" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <FiPhone className="w-4 h-4" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {(client.city || client.country) && (
                  <div className="flex items-center gap-2">
                    <FiMapPin className="w-4 h-4" />
                    <span>
                      {[client.city, client.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {(permissions.edit || permissions.delete) && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {permissions.edit && (
                    <button
                      onClick={() => handleEdit(client)}
                      className="btn-secondary py-1.5 px-3 text-sm flex-1 flex items-center justify-center gap-1"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}
                  {permissions.delete && (
                    <button
                      onClick={() => setDeleteConfirm(client._id)}
                      className="btn-danger py-1.5 px-3 text-sm flex items-center justify-center gap-1"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No clients found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm
              ? 'Try adjusting your search'
              : 'Get started by adding your first client'}
          </p>
          {permissions.create && !searchTerm && (
            <button onClick={handleCreate} className="btn-primary">
              Add Client
            </button>
          )}
        </div>
      )}

      {/* Client Modal */}
      {showModal && (
        <ClientModal
          client={editingClient}
          onClose={() => {
            setShowModal(false)
            setEditingClient(null)
          }}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete Client
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this client? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="btn-danger flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface ClientModalProps {
  client: ClientData | null
  onClose: () => void
  onSave: (data: Partial<ClientData>) => void
}

function ClientModal({ client, onClose, onSave }: ClientModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: client?.name || '',
    ice: client?.ice || '',
    email: client?.email || '',
    phone: client?.phone || '',
    address: client?.address || '',
    city: client?.city || '',
    country: client?.country || 'Morocco',
    postalCode: client?.postalCode || '',
    contactPerson: client?.contactPerson || '',
    contactEmail: client?.contactEmail || '',
    contactPhone: client?.contactPhone || '',
    notes: client?.notes || '',
    isActive: client?.isActive ?? true,
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await onSave(formData)
    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {client ? 'Edit Client' : 'New Client'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Client Name *</label>
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
                <label className="label">ICE (15 digits)</label>
                <input
                  type="text"
                  name="ice"
                  value={formData.ice}
                  onChange={handleChange}
                  className="input-field"
                  maxLength={15}
                  pattern="\d{15}"
                  placeholder="000000000000000"
                />
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Contact Person */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Contact Person
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Phone</label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="input-field"
              rows={3}
            />
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 text-primary-700 focus:ring-primary-500"
              />
              <span className="text-gray-900 dark:text-white">Active</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1">
              {isLoading ? 'Saving...' : client ? 'Update Client' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
