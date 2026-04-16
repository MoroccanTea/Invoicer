import mongoose, { Schema, Document, Model } from 'mongoose'

export type InvoiceStatus = 'pending' | 'cancelled' | 'paid_pending_taxes' | 'all_paid'
export type ActivityCategory = 'teaching' | 'software_development' | 'consulting' | 'pentesting'
export type BillingType = 'daily' | 'hourly' | 'fixed'

export interface IInvoiceItem {
  description: string
  quantity: number // hours, days, or units
  unitPrice: number // price per unit (HT)
  amount: number // quantity * unitPrice
}

export interface IInvoice extends Document {
  _id: mongoose.Types.ObjectId
  invoiceNumber: string // Format: MM-YYYY-CATEGORY-XXX
  project: mongoose.Types.ObjectId
  client: mongoose.Types.ObjectId
  category: ActivityCategory
  billingType: BillingType
  status: InvoiceStatus

  items: IInvoiceItem[]

  subtotal: number // Total HT (Hors Taxes)
  taxRate: number
  taxAmount: number
  total: number // TTC (Toutes Taxes Comprises)

  issueDate: Date
  dueDate: Date
  paidDate?: Date

  notes?: string
  termsAndConditions?: string

  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const invoiceItemSchema = new Schema<IInvoiceItem>(
  {
    description: {
      type: String,
      required: [true, 'Item description is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.01, 'Quantity must be greater than 0'],
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative'],
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
)

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client is required'],
    },
    category: {
      type: String,
      enum: ['teaching', 'software_development', 'consulting', 'pentesting'],
      required: [true, 'Activity category is required'],
    },
    billingType: {
      type: String,
      enum: ['daily', 'hourly', 'fixed'],
      required: [true, 'Billing type is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'cancelled', 'paid_pending_taxes', 'all_paid'],
      default: 'pending',
    },

    items: {
      type: [invoiceItemSchema],
      required: true,
      validate: {
        validator: function (v: IInvoiceItem[]) {
          return v && v.length > 0
        },
        message: 'At least one item is required',
      },
    },

    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative'],
    },
    taxRate: {
      type: Number,
      required: true,
      min: [0, 'Tax rate cannot be negative'],
      max: [100, 'Tax rate cannot exceed 100%'],
    },
    taxAmount: {
      type: Number,
      required: true,
      min: [0, 'Tax amount cannot be negative'],
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative'],
    },

    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidDate: {
      type: Date,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    termsAndConditions: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
invoiceSchema.index({ project: 1 })
invoiceSchema.index({ client: 1 })
invoiceSchema.index({ status: 1 })
invoiceSchema.index({ category: 1 })
invoiceSchema.index({ issueDate: -1 })
invoiceSchema.index({ createdBy: 1 })

const Invoice: Model<IInvoice> =
  mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', invoiceSchema)

export default Invoice
