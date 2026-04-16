import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IPermissions {
  clients: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
  }
  projects: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
  }
  invoices: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
    export: boolean
  }
  users: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
  }
  configuration: {
    view: boolean
    edit: boolean
  }
  reports: {
    view: boolean
    export: boolean
  }
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  email: string
  password: string
  firstName: string
  lastName: string
  cnie?: string
  phone?: string
  avatar?: string
  role: 'admin' | 'manager' | 'user'
  permissions: IPermissions
  isActive: boolean
  mustChangePassword: boolean
  notificationsEnabled: boolean
  taxReminderEnabled: boolean
  language: 'en' | 'fr' | 'ar' | 'es'
  // 2FA fields
  twoFactorEnabled: boolean
  twoFactorSecret?: string
  twoFactorBackupCodes?: string[]
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const permissionsSchema = new Schema<IPermissions>(
  {
    clients: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    projects: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    invoices: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      export: { type: Boolean, default: false },
    },
    users: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    configuration: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
    },
    reports: {
      view: { type: Boolean, default: false },
      export: { type: Boolean, default: false },
    },
  },
  { _id: false }
)

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    cnie: {
      type: String,
      trim: true,
      sparse: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'user'],
      default: 'user',
    },
    permissions: {
      type: permissionsSchema,
      default: () => ({
        clients: { view: true, create: false, edit: false, delete: false },
        projects: { view: true, create: false, edit: false, delete: false },
        invoices: { view: true, create: false, edit: false, delete: false, export: false },
        users: { view: false, create: false, edit: false, delete: false },
        configuration: { view: false, edit: false },
        reports: { view: true, export: false },
      }),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    mustChangePassword: {
      type: Boolean,
      default: true,
    },
    notificationsEnabled: {
      type: Boolean,
      default: false,
    },
    taxReminderEnabled: {
      type: Boolean,
      default: false,
    },
    language: {
      type: String,
      enum: ['en', 'fr', 'ar', 'es'],
      default: 'en',
    },
    // 2FA fields
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false, // Don't include in queries by default for security
    },
    twoFactorBackupCodes: {
      type: [String],
      select: false, // Don't include in queries by default for security
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return

  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
})

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Set full permissions for admin
userSchema.pre('save', function () {
  if (this.role === 'admin') {
    this.permissions = {
      clients: { view: true, create: true, edit: true, delete: true },
      projects: { view: true, create: true, edit: true, delete: true },
      invoices: { view: true, create: true, edit: true, delete: true, export: true },
      users: { view: true, create: true, edit: true, delete: true },
      configuration: { view: true, edit: true },
      reports: { view: true, export: true },
    }
  }
})

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema)

export default User
