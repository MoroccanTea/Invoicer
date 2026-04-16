'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiFileText,
  FiEye,
  FiDownload,
  FiFilter,
  FiDollarSign,
} from 'react-icons/fi'

type InvoiceStatus = 'pending' | 'cancelled' | 'paid_pending_taxes' | 'all_paid'
type ActivityCategory = 'teaching' | 'software_development' | 'consulting' | 'pentesting'
type BillingType = 'daily' | 'hourly' | 'fixed'

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

interface InvoiceData {
  _id: string
  invoiceNumber: string
  project: { _id: string; name: string } | null
  client: { _id: string; name: string; ice?: string } | null
  category: ActivityCategory
  billingType: BillingType
  status: InvoiceStatus
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  issueDate: string
  dueDate: string
  paidDate: string | null
  notes?: string
  createdAt: string
}

interface ProjectOption {
  _id: string
  name: string
  client: { _id: string; name: string; ice?: string } | null
}

interface ConfigData {
  taxRate: number
  taxName: string
  currency: string
  currencySymbol: string
  defaultPaymentTerms: number
}

interface Permissions {
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
  export: boolean
}

interface Props {
  initialInvoices: InvoiceData[]
  projects: ProjectOption[]
  config: ConfigData
  permissions: Permissions
}

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; class: string }> = {
  pending: { label: 'Pending', class: 'status-pending' },
  cancelled: { label: 'Cancelled', class: 'status-cancelled' },
  paid_pending_taxes: { label: 'Paid - Pending Taxes', class: 'status-active' },
  all_paid: { label: 'All Paid', class: 'status-completed' },
}

const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  teaching: 'Teaching',
  software_development: 'Software Development',
  consulting: 'Consulting',
  pentesting: 'Pentesting',
}

export default function InvoicesClient({
  initialInvoices,
  projects,
  config,
  permissions,
}: Props) {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<InvoiceData | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const router = useRouter()

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.project?.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatCurrency = (amount: number) => {
    return `${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)} ${config.currencySymbol}`
  }

  const handleCreate = () => {
    setEditingInvoice(null)
    setShowModal(true)
  }

  const handleEdit = (invoice: InvoiceData) => {
    setEditingInvoice(invoice)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/invoices/${id}`, { method: 'DELETE' })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete invoice')
      }

      setInvoices(invoices.filter((i) => i._id !== id))
      toast.success('Invoice deleted successfully')
      setDeleteConfirm(null)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleStatusChange = async (id: string, status: InvoiceStatus) => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update status')
      }

      setInvoices(invoices.map((i) => (i._id === id ? { ...i, ...result } : i)))
      toast.success('Status updated')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleSave = async (data: any) => {
    try {
      const url = editingInvoice
        ? `/api/invoices/${editingInvoice._id}`
        : '/api/invoices'
      const method = editingInvoice ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save invoice')
      }

      // Refetch to get populated data
      const fullInvoice = await fetch(`/api/invoices/${result._id}`).then((r) =>
        r.json()
      )

      if (editingInvoice) {
        setInvoices(invoices.map((i) => (i._id === editingInvoice._id ? fullInvoice : i)))
      } else {
        setInvoices([fullInvoice, ...invoices])
      }

      toast.success(editingInvoice ? 'Invoice updated' : 'Invoice created')
      setShowModal(false)
      setEditingInvoice(null)
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
            Invoices
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage your invoices
          </p>
        </div>

        {permissions.create && (
          <button
            onClick={handleCreate}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            New Invoice
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by invoice #, client, or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <div className="relative">
          <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
            className="input-field pl-10 pr-8"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid_pending_taxes">Paid - Pending Taxes</option>
            <option value="all_paid">All Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      {filteredInvoices.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="table-header">Invoice #</th>
                  <th className="table-header">Client</th>
                  <th className="table-header">Project</th>
                  <th className="table-header">Category</th>
                  <th className="table-header">Total</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Due Date</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                  >
                    <td className="table-cell font-mono font-medium">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="table-cell">{invoice.client?.name || '-'}</td>
                    <td className="table-cell">{invoice.project?.name || '-'}</td>
                    <td className="table-cell text-sm">
                      {CATEGORY_LABELS[invoice.category]}
                    </td>
                    <td className="table-cell font-medium">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="table-cell">
                      {permissions.edit ? (
                        <select
                          value={invoice.status}
                          onChange={(e) =>
                            handleStatusChange(
                              invoice._id,
                              e.target.value as InvoiceStatus
                            )
                          }
                          className={`status-badge ${STATUS_CONFIG[invoice.status].class} border-0 cursor-pointer`}
                        >
                          {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                            <option key={value} value={value}>
                              {config.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`status-badge ${STATUS_CONFIG[invoice.status].class}`}
                        >
                          {STATUS_CONFIG[invoice.status].label}
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/dashboard/invoices/${invoice._id}`}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          title="View"
                        >
                          <FiEye className="w-4 h-4" />
                        </Link>
                        {permissions.export && (
                          <Link
                            href={`/api/invoices/${invoice._id}/pdf`}
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            title="Download PDF"
                          >
                            <FiDownload className="w-4 h-4" />
                          </Link>
                        )}
                        {permissions.edit && (
                          <button
                            onClick={() => handleEdit(invoice)}
                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                        )}
                        {permissions.delete && (
                          <button
                            onClick={() => setDeleteConfirm(invoice._id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No invoices found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first invoice'}
          </p>
          {permissions.create && !searchTerm && statusFilter === 'all' && (
            <button onClick={handleCreate} className="btn-primary">
              Create Invoice
            </button>
          )}
        </div>
      )}

      {/* Invoice Modal */}
      {showModal && (
        <InvoiceModal
          invoice={editingInvoice}
          projects={projects}
          config={config}
          onClose={() => {
            setShowModal(false)
            setEditingInvoice(null)
          }}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete Invoice
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this invoice? This action cannot be
              undone.
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

interface InvoiceModalProps {
  invoice: InvoiceData | null
  projects: ProjectOption[]
  config: ConfigData
  onClose: () => void
  onSave: (data: any) => void
}

function InvoiceModal({
  invoice,
  projects,
  config,
  onClose,
  onSave,
}: InvoiceModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [applyTax, setApplyTax] = useState(
    invoice ? invoice.taxRate > 0 : config.taxRate > 0
  )
  const [formData, setFormData] = useState({
    project: invoice?.project?._id || '',
    category: invoice?.category || ('software_development' as ActivityCategory),
    billingType: invoice?.billingType || ('hourly' as BillingType),
    status: invoice?.status || ('pending' as InvoiceStatus),
    issueDate: invoice?.issueDate
      ? format(new Date(invoice.issueDate), 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd'),
    dueDate: invoice?.dueDate
      ? format(new Date(invoice.dueDate), 'yyyy-MM-dd')
      : format(
          new Date(Date.now() + config.defaultPaymentTerms * 24 * 60 * 60 * 1000),
          'yyyy-MM-dd'
        ),
    notes: invoice?.notes || '',
  })

  const [items, setItems] = useState<InvoiceItem[]>(
    invoice?.items || [{ description: '', quantity: 1, unitPrice: 0, amount: 0 }]
  )

  const selectedProject = projects.find((p) => p._id === formData.project)

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
  const effectiveTaxRate = applyTax ? config.taxRate : 0
  const taxAmount = subtotal * (effectiveTaxRate / 100)
  const total = subtotal + taxAmount

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setItems((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        [field]: value,
      }
      // Recalculate amount
      updated[index].amount = updated[index].quantity * updated[index].unitPrice
      return updated
    })
  }

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { description: '', quantity: 1, unitPrice: 0, amount: 0 },
    ])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.project) {
      toast.error('Please select a project')
      return
    }

    if (items.some((item) => !item.description || item.quantity <= 0)) {
      toast.error('Please fill in all item details')
      return
    }

    setIsLoading(true)
    await onSave({
      ...formData,
      client: selectedProject?.client?._id,
      items,
      subtotal,
      taxRate: effectiveTaxRate,
      taxAmount,
      total,
    })
    setIsLoading(false)
  }

  const getBillingLabel = () => {
    switch (formData.billingType) {
      case 'hourly':
        return 'Hours'
      case 'daily':
        return 'Days'
      case 'fixed':
        return 'Units'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {invoice ? 'Edit Invoice' : 'New Invoice'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Project *</label>
              <select
                name="project"
                value={formData.project}
                onChange={handleChange}
                className="input-field"
                required
                disabled={!!invoice}
              >
                <option value="">Select a project...</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                    {project.client ? ` (${project.client.name})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
                disabled={!!invoice}
              >
                <option value="teaching">Teaching</option>
                <option value="software_development">Software Development</option>
                <option value="consulting">Consulting</option>
                <option value="pentesting">Pentesting</option>
              </select>
            </div>
          </div>

          {/* Billing Type and Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Billing Type *</label>
              <select
                name="billingType"
                value={formData.billingType}
                onChange={handleChange}
                className="input-field"
              >
                <option value="hourly">Hourly Rate</option>
                <option value="daily">Daily Rate</option>
                <option value="fixed">Fixed Price per Task</option>
              </select>
            </div>

            <div>
              <label className="label">Issue Date *</label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Due Date *</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Invoice Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0">
                Items (Prices are HT - excluding {config.taxName})
              </label>
              <button
                type="button"
                onClick={addItem}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 items-start p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                >
                  <div className="col-span-12 md:col-span-5">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, 'description', e.target.value)
                      }
                      className="input-field text-sm"
                      required
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <input
                      type="number"
                      placeholder={getBillingLabel()}
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          'quantity',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="input-field text-sm"
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <input
                      type="number"
                      placeholder="Unit Price"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          'unitPrice',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="input-field text-sm"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <div className="input-field text-sm bg-gray-100 dark:bg-gray-600 text-right">
                      {item.amount.toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={applyTax}
                onChange={(e) => setApplyTax(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary-700 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Apply {config.taxName} ({config.taxRate}%)
              </span>
            </label>

            <div className="space-y-2 text-right">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal (HT)</span>
                <span className="font-medium">
                  {subtotal.toFixed(2)} {config.currencySymbol}
                </span>
              </div>
              {applyTax && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {config.taxName} ({config.taxRate}%)
                  </span>
                  <span className="font-medium">
                    {taxAmount.toFixed(2)} {config.currencySymbol}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {applyTax ? 'Total (TTC)' : 'Total'}
                </span>
                <span className="font-bold text-lg text-primary-700 dark:text-primary-400">
                  {total.toFixed(2)} {config.currencySymbol}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label">
              Notes{' '}
              <span className="font-normal text-gray-400 dark:text-gray-500">(will appear on invoice)</span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="input-field"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.project}
              className="btn-primary flex-1"
            >
              {isLoading ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
