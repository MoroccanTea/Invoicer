import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IConfig extends Document {
  _id: mongoose.Types.ObjectId
  systemType: 'morocco' | 'generic'

  // Business Information
  businessName: string
  businessAddress: string
  businessCity?: string
  businessCountry: string
  businessPostalCode?: string
  businessPhone?: string
  businessEmail?: string
  businessWebsite?: string

  // Morocco-specific fields
  ice?: string // Identifiant Commun de l'Entreprise
  taxeProfessionnelle?: string
  identifiantFiscal?: string // IF
  rc?: string // Registre du Commerce
  cnss?: string // CNSS number

  // Banking Information
  bankName?: string
  bankAccountName?: string
  rib?: string // Relevé d'Identité Bancaire
  iban?: string
  swift?: string

  // Financial Settings
  currency: string
  currencySymbol: string
  taxRate: number // VAT/TVA percentage
  taxName: string // e.g., "TVA", "VAT", "Sales Tax"

  // Branding
  logo?: string
  digitalSignature?: string
  digitalStamp?: string
  primaryColor: string

  // Invoice Settings
  invoicePrefix?: string
  invoiceFooterText?: string
  termsAndConditions?: string
  defaultPaymentTerms: number // days

  // Notification Settings
  taxReminderMonths: number[] // 1=Jan, 4=Apr, 7=Jul, 10=Oct for Morocco quarterly

  // Templates
  invoiceTemplate?: string

  isConfigured: boolean
  createdAt: Date
  updatedAt: Date
}

const configSchema = new Schema<IConfig>(
  {
    systemType: {
      type: String,
      enum: ['morocco', 'generic'],
      required: true,
      default: 'generic',
    },

    // Business Information
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: [200, 'Business name cannot exceed 200 characters'],
    },
    businessAddress: {
      type: String,
      required: [true, 'Business address is required'],
      trim: true,
    },
    businessCity: {
      type: String,
      trim: true,
    },
    businessCountry: {
      type: String,
      required: true,
      default: 'Morocco',
    },
    businessPostalCode: {
      type: String,
      trim: true,
    },
    businessPhone: {
      type: String,
      trim: true,
    },
    businessEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    businessWebsite: {
      type: String,
      trim: true,
    },

    // Morocco-specific fields
    ice: {
      type: String,
      trim: true,
      validate: {
        validator: function (this: any, v: string) {
          if (this.systemType === 'morocco' && !v) return false
          if (v && !/^\d{15}$/.test(v)) return false
          return true
        },
        message: 'ICE must be 15 digits for Morocco system',
      },
    },
    taxeProfessionnelle: {
      type: String,
      trim: true,
    },
    identifiantFiscal: {
      type: String,
      trim: true,
    },
    rc: {
      type: String,
      trim: true,
    },
    cnss: {
      type: String,
      trim: true,
    },

    // Banking Information
    bankName: {
      type: String,
      trim: true,
    },
    bankAccountName: {
      type: String,
      trim: true,
    },
    rib: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          if (v && !/^\d{24}$/.test(v.replace(/\s/g, ''))) return false
          return true
        },
        message: 'RIB must be 24 digits',
      },
    },
    iban: {
      type: String,
      trim: true,
    },
    swift: {
      type: String,
      trim: true,
    },

    // Financial Settings
    currency: {
      type: String,
      required: true,
      default: 'MAD',
      trim: true,
    },
    currencySymbol: {
      type: String,
      required: true,
      default: 'DH',
      trim: true,
    },
    taxRate: {
      type: Number,
      required: true,
      default: 20, // 20% TVA in Morocco
      min: [0, 'Tax rate cannot be negative'],
      max: [100, 'Tax rate cannot exceed 100%'],
    },
    taxName: {
      type: String,
      required: true,
      default: 'TVA',
      trim: true,
    },

    // Branding
    logo: {
      type: String,
    },
    digitalSignature: {
      type: String,
    },
    digitalStamp: {
      type: String,
    },
    primaryColor: {
      type: String,
      default: '#230082',
    },

    // Invoice Settings
    invoicePrefix: {
      type: String,
      trim: true,
      default: 'INV',
    },
    invoiceFooterText: {
      type: String,
      trim: true,
    },
    termsAndConditions: {
      type: String,
      trim: true,
    },
    defaultPaymentTerms: {
      type: Number,
      default: 30,
      min: [0, 'Payment terms cannot be negative'],
    },

    // Notification Settings
    taxReminderMonths: {
      type: [Number],
      default: [1, 4, 7, 10], // Quarterly for Morocco
    },

    // Templates
    invoiceTemplate: {
      type: String,
    },

    isConfigured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Ensure only one config document exists
configSchema.statics.getConfig = async function () {
  let config = await this.findOne()
  if (!config) {
    config = await this.create({
      systemType: 'generic',
      businessName: 'My Business',
      businessAddress: 'Address not set',
      businessCountry: 'Not set',
      isConfigured: false,
    })
  }
  return config
}

const Config: Model<IConfig> =
  mongoose.models.Config || mongoose.model<IConfig>('Config', configSchema)

export default Config
