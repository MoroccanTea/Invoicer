'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  FiGlobe,
  FiSave,
  FiUpload,
  FiMapPin,
  FiDollarSign,
  FiFileText,
  FiImage,
} from 'react-icons/fi'

interface ConfigData {
  _id: string
  systemType: 'morocco' | 'generic'
  businessName: string
  businessAddress: string
  businessCity?: string
  businessCountry: string
  businessPostalCode?: string
  businessPhone?: string
  businessEmail?: string
  businessWebsite?: string
  ice?: string
  taxeProfessionnelle?: string
  identifiantFiscal?: string
  rc?: string
  cnss?: string
  bankName?: string
  bankAccountName?: string
  rib?: string
  iban?: string
  swift?: string
  currency: string
  currencySymbol: string
  taxRate: number
  taxName: string
  logo?: string
  digitalSignature?: string
  digitalStamp?: string
  primaryColor: string
  invoicePrefix?: string
  invoiceFooterText?: string
  termsAndConditions?: string
  defaultPaymentTerms: number
  isConfigured: boolean
}

interface Props {
  initialConfig: ConfigData
  canEdit: boolean
}

const CURRENCIES = [
  { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
]

export default function ConfigurationClient({ initialConfig, canEdit }: Props) {
  const [config, setConfig] = useState<ConfigData>(initialConfig)
  const [activeTab, setActiveTab] = useState<'system' | 'business' | 'financial' | 'branding' | 'invoice'>('system')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setConfig((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleSystemTypeChange = (type: 'morocco' | 'generic') => {
    setConfig((prev) => ({
      ...prev,
      systemType: type,
      currency: type === 'morocco' ? 'MAD' : prev.currency,
      currencySymbol: type === 'morocco' ? 'DH' : prev.currencySymbol,
      taxRate: type === 'morocco' ? 20 : prev.taxRate,
      taxName: type === 'morocco' ? 'TVA' : prev.taxName,
      businessCountry: type === 'morocco' ? 'Morocco' : prev.businessCountry,
    }))
  }

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const currency = CURRENCIES.find((c) => c.code === e.target.value)
    if (currency) {
      setConfig((prev) => ({
        ...prev,
        currency: currency.code,
        currencySymbol: currency.symbol,
      }))
    }
  }

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logo' | 'digitalSignature' | 'digitalStamp'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    // For now, convert to base64
    const reader = new FileReader()
    reader.onloadend = () => {
      setConfig((prev) => ({
        ...prev,
        [field]: reader.result as string,
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canEdit) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/configuration', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save configuration')
      }

      toast.success('Configuration saved successfully')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'system', label: 'System', icon: FiGlobe },
    { id: 'business', label: 'Business Info', icon: FiMapPin },
    { id: 'financial', label: 'Financial', icon: FiDollarSign },
    { id: 'branding', label: 'Branding', icon: FiImage },
    { id: 'invoice', label: 'Invoice Settings', icon: FiFileText },
  ] as const

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Configuration
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Set up your business information and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-700 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card p-6">
          {/* System Type Selection */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                System Type
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose the system type based on your location. Morocco system includes specific tax fields required for Moroccan businesses.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleSystemTypeChange('morocco')}
                  disabled={!canEdit}
                  className={`p-6 rounded-xl border-2 transition-colors text-left ${
                    config.systemType === 'morocco'
                      ? 'border-primary-700 bg-primary-50 dark:bg-primary-800 dark:border-primary-600'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-2">🇲🇦</div>
                  <h3 className={`font-semibold ${
                    config.systemType === 'morocco'
                      ? 'text-primary-900 dark:text-primary-100'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    Morocco
                  </h3>
                  <p className={`text-sm mt-1 ${
                    config.systemType === 'morocco'
                      ? 'text-primary-700 dark:text-primary-200'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    Includes ICE, IF, TP, and TVA fields. Currency set to MAD (Dirham).
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSystemTypeChange('generic')}
                  disabled={!canEdit}
                  className={`p-6 rounded-xl border-2 transition-colors text-left ${
                    config.systemType === 'generic'
                      ? 'border-primary-700 bg-primary-50 dark:bg-primary-800 dark:border-primary-600'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-2">🌍</div>
                  <h3 className={`font-semibold ${
                    config.systemType === 'generic'
                      ? 'text-primary-900 dark:text-primary-100'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    Generic / International
                  </h3>
                  <p className={`text-sm mt-1 ${
                    config.systemType === 'generic'
                      ? 'text-primary-700 dark:text-primary-200'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    Flexible configuration for any country. Choose your currency and tax settings.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Business Information */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Business Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label">Business Name *</label>
                  <input
                    type="text"
                    name="businessName"
                    value={config.businessName}
                    onChange={handleChange}
                    className="input-field"
                    required
                    disabled={!canEdit}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label">Address *</label>
                  <input
                    type="text"
                    name="businessAddress"
                    value={config.businessAddress}
                    onChange={handleChange}
                    className="input-field"
                    required
                    disabled={!canEdit}
                  />
                </div>

                <div>
                  <label className="label">City</label>
                  <input
                    type="text"
                    name="businessCity"
                    value={config.businessCity || ''}
                    onChange={handleChange}
                    className="input-field"
                    disabled={!canEdit}
                  />
                </div>

                <div>
                  <label className="label">Postal Code</label>
                  <input
                    type="text"
                    name="businessPostalCode"
                    value={config.businessPostalCode || ''}
                    onChange={handleChange}
                    className="input-field"
                    disabled={!canEdit}
                  />
                </div>

                <div>
                  <label className="label">Country *</label>
                  <input
                    type="text"
                    name="businessCountry"
                    value={config.businessCountry}
                    onChange={handleChange}
                    className="input-field"
                    required
                    disabled={!canEdit || config.systemType === 'morocco'}
                  />
                </div>

                <div>
                  <label className="label">Phone</label>
                  <input
                    type="tel"
                    name="businessPhone"
                    value={config.businessPhone || ''}
                    onChange={handleChange}
                    className="input-field"
                    disabled={!canEdit}
                  />
                </div>

                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    name="businessEmail"
                    value={config.businessEmail || ''}
                    onChange={handleChange}
                    className="input-field"
                    disabled={!canEdit}
                  />
                </div>

                <div>
                  <label className="label">Website</label>
                  <input
                    type="url"
                    name="businessWebsite"
                    value={config.businessWebsite || ''}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="https://"
                    disabled={!canEdit}
                  />
                </div>
              </div>

              {/* Morocco-specific fields */}
              {config.systemType === 'morocco' && (
                <>
                  <hr className="border-gray-200 dark:border-gray-700" />
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                    Morocco Tax Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">ICE (15 digits) *</label>
                      <input
                        type="text"
                        name="ice"
                        value={config.ice || ''}
                        onChange={handleChange}
                        className="input-field"
                        maxLength={15}
                        pattern="\d{15}"
                        required={config.systemType === 'morocco'}
                        disabled={!canEdit}
                        placeholder="000000000000000"
                      />
                    </div>

                    <div>
                      <label className="label">Identifiant Fiscal (IF)</label>
                      <input
                        type="text"
                        name="identifiantFiscal"
                        value={config.identifiantFiscal || ''}
                        onChange={handleChange}
                        className="input-field"
                        disabled={!canEdit}
                      />
                    </div>

                    <div>
                      <label className="label">Taxe Professionnelle (TP)</label>
                      <input
                        type="text"
                        name="taxeProfessionnelle"
                        value={config.taxeProfessionnelle || ''}
                        onChange={handleChange}
                        className="input-field"
                        disabled={!canEdit}
                      />
                    </div>

                    <div>
                      <label className="label">Registre du Commerce (RC)</label>
                      <input
                        type="text"
                        name="rc"
                        value={config.rc || ''}
                        onChange={handleChange}
                        className="input-field"
                        disabled={!canEdit}
                      />
                    </div>

                    <div>
                      <label className="label">CNSS</label>
                      <input
                        type="text"
                        name="cnss"
                        value={config.cnss || ''}
                        onChange={handleChange}
                        className="input-field"
                        disabled={!canEdit}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Banking Information */}
              <hr className="border-gray-200 dark:border-gray-700" />
              <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                Banking Information (Optional)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    value={config.bankName || ''}
                    onChange={handleChange}
                    className="input-field"
                    disabled={!canEdit}
                  />
                </div>

                <div>
                  <label className="label">Account Name</label>
                  <input
                    type="text"
                    name="bankAccountName"
                    value={config.bankAccountName || ''}
                    onChange={handleChange}
                    className="input-field"
                    disabled={!canEdit}
                  />
                </div>

                {config.systemType === 'morocco' && (
                  <div>
                    <label className="label">RIB (24 digits)</label>
                    <input
                      type="text"
                      name="rib"
                      value={config.rib || ''}
                      onChange={handleChange}
                      className="input-field"
                      maxLength={24}
                      disabled={!canEdit}
                    />
                  </div>
                )}

                <div>
                  <label className="label">IBAN</label>
                  <input
                    type="text"
                    name="iban"
                    value={config.iban || ''}
                    onChange={handleChange}
                    className="input-field"
                    disabled={!canEdit}
                  />
                </div>

                <div>
                  <label className="label">SWIFT/BIC</label>
                  <input
                    type="text"
                    name="swift"
                    value={config.swift || ''}
                    onChange={handleChange}
                    className="input-field"
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Financial Settings */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Financial Settings
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Currency</label>
                  <select
                    name="currency"
                    value={config.currency}
                    onChange={handleCurrencyChange}
                    className="input-field"
                    disabled={!canEdit}
                  >
                    {CURRENCIES.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} ({currency.symbol}) - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Tax Name</label>
                  <input
                    type="text"
                    name="taxName"
                    value={config.taxName}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., TVA, VAT, Sales Tax"
                    disabled={!canEdit}
                  />
                </div>

                <div>
                  <label className="label">Tax Rate (%)</label>
                  <input
                    type="number"
                    name="taxRate"
                    value={config.taxRate}
                    onChange={handleChange}
                    className="input-field"
                    min="0"
                    max="100"
                    step="0.01"
                    disabled={!canEdit}
                  />
                </div>

                <div>
                  <label className="label">Default Payment Terms (days)</label>
                  <input
                    type="number"
                    name="defaultPaymentTerms"
                    value={config.defaultPaymentTerms}
                    onChange={handleChange}
                    className="input-field"
                    min="0"
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Branding */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Branding
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Logo</label>
                  <div className="mt-2">
                    {config.logo && (
                      <img
                        src={config.logo}
                        alt="Logo"
                        className="w-32 h-32 object-contain mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-2"
                      />
                    )}
                    <label className={`btn-secondary inline-flex items-center gap-2 cursor-pointer ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <FiUpload className="w-4 h-4" />
                      Upload Logo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'logo')}
                        disabled={!canEdit}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="label">Primary Color</label>
                  <div className="flex items-center gap-3 mt-2">
                    <input
                      type="color"
                      name="primaryColor"
                      value={config.primaryColor}
                      onChange={handleChange}
                      className="w-12 h-12 rounded-lg cursor-pointer"
                      disabled={!canEdit}
                    />
                    <input
                      type="text"
                      name="primaryColor"
                      value={config.primaryColor}
                      onChange={handleChange}
                      className="input-field w-32"
                      disabled={!canEdit}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Digital Signature</label>
                  <div className="mt-2">
                    {config.digitalSignature && (
                      <img
                        src={config.digitalSignature}
                        alt="Signature"
                        className="w-48 h-24 object-contain mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-2"
                      />
                    )}
                    <label className={`btn-secondary inline-flex items-center gap-2 cursor-pointer ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <FiUpload className="w-4 h-4" />
                      Upload Signature
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'digitalSignature')}
                        disabled={!canEdit}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="label">Digital Stamp</label>
                  <div className="mt-2">
                    {config.digitalStamp && (
                      <img
                        src={config.digitalStamp}
                        alt="Stamp"
                        className="w-32 h-32 object-contain mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-2"
                      />
                    )}
                    <label className={`btn-secondary inline-flex items-center gap-2 cursor-pointer ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <FiUpload className="w-4 h-4" />
                      Upload Stamp
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'digitalStamp')}
                        disabled={!canEdit}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invoice Settings */}
          {activeTab === 'invoice' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Invoice Settings
              </h2>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="label">Invoice Prefix</label>
                  <input
                    type="text"
                    name="invoicePrefix"
                    value={config.invoicePrefix || ''}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., INV"
                    disabled={!canEdit}
                  />
                </div>

                <div>
                  <label className="label">Invoice Footer Text</label>
                  <textarea
                    name="invoiceFooterText"
                    value={config.invoiceFooterText || ''}
                    onChange={handleChange}
                    className="input-field"
                    rows={3}
                    placeholder="Text to appear at the bottom of invoices"
                    disabled={!canEdit}
                  />
                </div>

                <div>
                  <label className="label">Terms and Conditions</label>
                  <textarea
                    name="termsAndConditions"
                    value={config.termsAndConditions || ''}
                    onChange={handleChange}
                    className="input-field"
                    rows={5}
                    placeholder="Default terms and conditions for invoices"
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          {canEdit && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    Save Configuration
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
