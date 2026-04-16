'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { FiArrowLeft, FiDownload, FiPrinter } from 'react-icons/fi'

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
  client: {
    _id: string
    name: string
    ice?: string
    address?: string
    city?: string
    country?: string
    phone?: string
    email?: string
  } | null
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
}

interface ConfigData {
  businessName: string
  businessAddress: string
  businessCity?: string
  businessCountry: string
  businessPhone?: string
  businessEmail?: string
  ice?: string
  identifiantFiscal?: string
  taxeProfessionnelle?: string
  rc?: string
  bankName?: string
  rib?: string
  iban?: string
  currency: string
  currencySymbol: string
  taxRate: number
  taxName: string
  logo?: string
  digitalSignature?: string
  digitalStamp?: string
  invoiceFooterText?: string
  termsAndConditions?: string
}

interface Props {
  invoice: InvoiceData
  config: ConfigData | null
  canExport: boolean
}

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  pending: 'Pending',
  cancelled: 'Cancelled',
  paid_pending_taxes: 'Paid - Pending Taxes',
  all_paid: 'All Paid',
}

const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  teaching: 'Teaching',
  software_development: 'Software Development',
  consulting: 'Consulting',
  pentesting: 'Pentesting',
}

const BILLING_LABELS: Record<BillingType, string> = {
  hourly: 'Hours',
  daily: 'Days',
  fixed: 'Units',
}

export default function InvoiceDetailClient({
  invoice,
  config,
  canExport,
}: Props) {
  const printRef = useRef<HTMLDivElement>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 no-print">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/invoices"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Invoice {invoice.invoiceNumber}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {CATEGORY_LABELS[invoice.category]} • {STATUS_LABELS[invoice.status]}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="btn-secondary flex items-center gap-2"
          >
            <FiPrinter className="w-4 h-4" />
            Print
          </button>
          {canExport && (
            <Link
              href={`/api/invoices/${invoice._id}/pdf`}
              className="btn-primary flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Download PDF
            </Link>
          )}
        </div>
      </div>

      {/* Invoice Preview */}
      <div
        ref={printRef}
        className="card p-8 md:p-12 max-w-4xl mx-auto bg-white dark:bg-gray-800"
        id="invoice-preview"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            {config?.logo ? (
              <img
                src={config.logo}
                alt="Logo"
                className="h-16 mb-4 object-contain"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-primary-700 flex items-center justify-center mb-4">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            )}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {config?.businessName || 'Your Business'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {config?.businessAddress}
            </p>
            {config?.businessCity && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {config.businessCity}, {config?.businessCountry}
              </p>
            )}
            {config?.businessPhone && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tel: {config.businessPhone}
              </p>
            )}
            {config?.businessEmail && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {config.businessEmail}
              </p>
            )}
          </div>

          <div className="text-right">
            <h1 className="text-3xl font-bold text-primary-700">FACTURE</h1>
            <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white mt-2">
              {invoice.invoiceNumber}
            </p>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p>Date: {format(new Date(invoice.issueDate), 'dd/MM/yyyy')}</p>
              <p>Due: {format(new Date(invoice.dueDate), 'dd/MM/yyyy')}</p>
            </div>
          </div>
        </div>

        {/* Business Tax Info */}
        {config?.ice && (
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 mb-6 text-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {config.ice && (
                <div>
                  <span className="text-gray-500">ICE:</span>{' '}
                  <span className="font-mono">{config.ice}</span>
                </div>
              )}
              {config.identifiantFiscal && (
                <div>
                  <span className="text-gray-500">IF:</span>{' '}
                  <span className="font-mono">{config.identifiantFiscal}</span>
                </div>
              )}
              {config.taxeProfessionnelle && (
                <div>
                  <span className="text-gray-500">TP:</span>{' '}
                  <span className="font-mono">{config.taxeProfessionnelle}</span>
                </div>
              )}
              {config.rc && (
                <div>
                  <span className="text-gray-500">RC:</span>{' '}
                  <span className="font-mono">{config.rc}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Client Info */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            FACTURÉ À
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
            <p className="font-semibold text-gray-900 dark:text-white">
              {invoice.client?.name}
            </p>
            {invoice.client?.ice && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ICE: {invoice.client.ice}
              </p>
            )}
            {invoice.client?.address && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {invoice.client.address}
              </p>
            )}
            {invoice.client?.city && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {invoice.client.city}, {invoice.client.country}
              </p>
            )}
          </div>
        </div>

        {/* Project */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">Projet:</span> {invoice.project?.name}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">Catégorie:</span>{' '}
            {CATEGORY_LABELS[invoice.category]}
          </p>
        </div>

        {/* Items Table */}
        <div className="mb-8 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-gray-600">
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Description
                </th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {BILLING_LABELS[invoice.billingType]}
                </th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Prix Unitaire (HT)
                </th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Total (HT)
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 dark:border-gray-700"
                >
                  <td className="py-3 px-2 text-gray-900 dark:text-white">
                    {item.description}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-600 dark:text-gray-400">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-600 dark:text-gray-400">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-gray-900 dark:text-white">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-full max-w-xs">
            <div className="flex justify-between py-2 text-gray-600 dark:text-gray-400">
              <span>Sous-total (HT)</span>
              <span>
                {formatCurrency(invoice.subtotal)} {config?.currencySymbol || 'DH'}
              </span>
            </div>
            <div className="flex justify-between py-2 text-gray-600 dark:text-gray-400">
              <span>{config?.taxName || 'TVA'} ({invoice.taxRate}%)</span>
              <span>
                {formatCurrency(invoice.taxAmount)} {config?.currencySymbol || 'DH'}
              </span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-gray-200 dark:border-gray-600 font-bold text-lg text-gray-900 dark:text-white">
              <span>Total (TTC)</span>
              <span className="text-primary-700">
                {formatCurrency(invoice.total)} {config?.currencySymbol || 'DH'}
              </span>
            </div>
          </div>
        </div>

        {/* Banking Info */}
        {(config?.bankName || config?.rib || config?.iban) && (
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Informations Bancaires
            </h4>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {config.bankName && <p>Banque: {config.bankName}</p>}
              {config.rib && <p>RIB: {config.rib}</p>}
              {config.iban && <p>IBAN: {config.iban}</p>}
            </div>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Notes
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {invoice.notes}
            </p>
          </div>
        )}

        {/* Footer */}
        {config?.invoiceFooterText && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
            {config.invoiceFooterText}
          </div>
        )}

        {/* Signature and Stamp */}
        {(config?.digitalSignature || config?.digitalStamp) && (
          <div className="flex justify-end gap-8 mt-8">
            {config.digitalSignature && (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Signature</p>
                <img
                  src={config.digitalSignature}
                  alt="Signature"
                  className="h-20 object-contain"
                />
              </div>
            )}
            {config.digitalStamp && (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Cachet</p>
                <img
                  src={config.digitalStamp}
                  alt="Stamp"
                  className="h-20 object-contain"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-preview,
          #invoice-preview * {
            visibility: visible;
          }
          #invoice-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          /* Force light mode for print regardless of current theme */
          #invoice-preview {
            background: #ffffff !important;
            color: #111827 !important;
          }
          #invoice-preview * {
            color: inherit !important;
            background-color: transparent !important;
            border-color: #e5e7eb !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          #invoice-preview h1,
          #invoice-preview h2,
          #invoice-preview h3,
          #invoice-preview h4,
          #invoice-preview p,
          #invoice-preview span,
          #invoice-preview td,
          #invoice-preview th {
            color: #111827 !important;
          }
          #invoice-preview .text-gray-500,
          #invoice-preview .text-gray-600,
          #invoice-preview .text-gray-400 {
            color: #6b7280 !important;
          }
          #invoice-preview .text-primary-700 {
            color: #1d4ed8 !important;
          }
          #invoice-preview .bg-gray-50,
          #invoice-preview [class*="bg-gray-7"] {
            background-color: #f9fafb !important;
          }
          #invoice-preview table,
          #invoice-preview thead tr,
          #invoice-preview tbody tr {
            border-color: #e5e7eb !important;
          }
        }
      `}</style>
    </div>
  )
}
