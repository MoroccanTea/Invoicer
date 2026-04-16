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
  FiShield,
  FiUser,
  FiMail,
  FiClock,
} from 'react-icons/fi'

interface Permissions {
  clients: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  projects: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  invoices: { view: boolean; create: boolean; edit: boolean; delete: boolean; export: boolean }
  users: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  configuration: { view: boolean; edit: boolean }
  reports: { view: boolean; export: boolean }
}

interface UserData {
  _id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'manager' | 'user'
  permissions: Permissions
  isActive: boolean
  lastLogin: string | null
  createdAt: string
}

interface Props {
  initialUsers: UserData[]
  currentUserId: string
  permissions: { view: boolean; create: boolean; edit: boolean; delete: boolean }
}

const ROLE_CONFIG: Record<string, { label: string; class: string }> = {
  admin: { label: 'Admin', class: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  manager: { label: 'Manager', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  user: { label: 'User', class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
}

export default function UsersClient({ initialUsers, currentUserId, permissions }: Props) {
  const [users, setUsers] = useState(initialUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const router = useRouter()

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = () => {
    setEditingUser(null)
    setShowModal(true)
  }

  const handleEdit = (user: UserData) => {
    setEditingUser(user)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}`, { method: 'DELETE' })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete user')
      }

      setUsers(users.filter((u) => u._id !== id))
      toast.success('User deleted successfully')
      setDeleteConfirm(null)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleSave = async (data: any) => {
    try {
      const url = editingUser ? `/api/users/${editingUser._id}` : '/api/users'
      const method = editingUser ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save user')
      }

      if (editingUser) {
        setUsers(users.map((u) => (u._id === editingUser._id ? result : u)))
      } else {
        setUsers([result, ...users])
        toast.success(`User created. Temporary password: ${result.tempPassword}`, {
          duration: 10000,
        })
      }

      toast.success(editingUser ? 'User updated' : 'User created')
      setShowModal(false)
      setEditingUser(null)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage users and their permissions
          </p>
        </div>

        {permissions.create && (
          <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
            <FiPlus className="w-4 h-4" />
            Add User
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="table-header">User</th>
                  <th className="table-header">Role</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Last Login</th>
                  {(permissions.edit || permissions.delete) && (
                    <th className="table-header text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700 dark:text-primary-400">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`status-badge ${ROLE_CONFIG[user.role].class}`}>
                        {ROLE_CONFIG[user.role].label}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`status-badge ${user.isActive ? 'status-active' : 'status-cancelled'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-cell text-gray-500">
                      {user.lastLogin ? (
                        <div className="flex items-center gap-2">
                          <FiClock className="w-4 h-4" />
                          {format(new Date(user.lastLogin), 'MMM d, yyyy HH:mm')}
                        </div>
                      ) : (
                        <span className="text-gray-400">Never</span>
                      )}
                    </td>
                    {(permissions.edit || permissions.delete) && (
                      <td className="table-cell text-right">
                        <div className="flex justify-end gap-2">
                          {permissions.edit && user._id !== currentUserId && (
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              title="Edit"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                          )}
                          {permissions.delete && user._id !== currentUserId && user.role !== 'admin' && (
                            <button
                              onClick={() => setDeleteConfirm(user._id)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              title="Delete"
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
          <FiUser className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No users found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm ? 'Try a different search' : 'Add your first team member'}
          </p>
        </div>
      )}

      {/* User Modal */}
      {showModal && (
        <UserModal
          user={editingUser}
          onClose={() => {
            setShowModal(false)
            setEditingUser(null)
          }}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete User
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this user?
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

interface UserModalProps {
  user: UserData | null
  onClose: () => void
  onSave: (data: any) => void
}

function UserModal({ user, onClose, onSave }: UserModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    role: user?.role || 'user',
    isActive: user?.isActive ?? true,
    permissions: user?.permissions || {
      clients: { view: true, create: false, edit: false, delete: false },
      projects: { view: true, create: false, edit: false, delete: false },
      invoices: { view: true, create: false, edit: false, delete: false, export: false },
      users: { view: false, create: false, edit: false, delete: false },
      configuration: { view: false, edit: false },
      reports: { view: true, export: false },
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handlePermissionChange = (
    category: keyof Permissions,
    action: string,
    checked: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [category]: {
          ...prev.permissions[category],
          [action]: checked,
        },
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await onSave(formData)
    setIsLoading(false)
  }

  const permissionGroups = [
    { key: 'clients', label: 'Clients', actions: ['view', 'create', 'edit', 'delete'] },
    { key: 'projects', label: 'Projects', actions: ['view', 'create', 'edit', 'delete'] },
    { key: 'invoices', label: 'Invoices', actions: ['view', 'create', 'edit', 'delete', 'export'] },
    { key: 'users', label: 'Users', actions: ['view', 'create', 'edit', 'delete'] },
    { key: 'configuration', label: 'Configuration', actions: ['view', 'edit'] },
    { key: 'reports', label: 'Reports', actions: ['view', 'export'] },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {user ? 'Edit User' : 'New User'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                required
                disabled={!!user}
              />
            </div>
            <div>
              <label className="label">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-field"
              >
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex items-center">
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
          </div>

          {/* Permissions */}
          {formData.role !== 'admin' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiShield className="w-5 h-5" />
                Permissions
              </h3>
              <div className="space-y-4">
                {permissionGroups.map((group) => (
                  <div key={group.key} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                    <p className="font-medium text-gray-900 dark:text-white mb-2">
                      {group.label}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {group.actions.map((action) => (
                        <label key={action} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={
                              (formData.permissions as any)[group.key]?.[action] || false
                            }
                            onChange={(e) =>
                              handlePermissionChange(
                                group.key as keyof Permissions,
                                action,
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 rounded border-gray-300 text-primary-700 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                            {action}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.role === 'admin' && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <p className="text-purple-800 dark:text-purple-200 text-sm">
                Admin users have full access to all features and permissions.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1">
              {isLoading ? 'Saving...' : user ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
