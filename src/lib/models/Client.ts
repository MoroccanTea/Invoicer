import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IClient extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  ice?: string // Unique for Morocco
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
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const clientSchema = new Schema<IClient>(
  {
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      maxlength: [200, 'Client name cannot exceed 200 characters'],
    },
    ice: {
      type: String,
      trim: true,
      sparse: true,
      validate: {
        validator: function (v: string) {
          if (v && !/^\d{15}$/.test(v)) return false
          return true
        },
        message: 'ICE must be 15 digits',
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      default: 'Morocco',
    },
    postalCode: {
      type: String,
      trim: true,
    },
    contactPerson: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
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

// Compound unique index for name and ice
clientSchema.index({ name: 1 }, { unique: true })
clientSchema.index({ ice: 1 }, { unique: true, sparse: true })

// Text index for searching
clientSchema.index({ name: 'text', contactPerson: 'text' })

const Client: Model<IClient> =
  mongoose.models.Client || mongoose.model<IClient>('Client', clientSchema)

export default Client
