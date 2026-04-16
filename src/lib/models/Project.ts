import mongoose, { Schema, Document, Model } from 'mongoose'

export type ProjectStatus = 'active' | 'completed' | 'cancelled' | 'on_hold'

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  description?: string
  client: mongoose.Types.ObjectId
  status: ProjectStatus
  startDate: Date
  endDate?: Date
  budget?: number
  notes?: string
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [200, 'Project name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client is required'],
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled', 'on_hold'],
      default: 'active',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now,
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (this: IProject, v: Date) {
          return !v || v >= this.startDate
        },
        message: 'End date must be after start date',
      },
    },
    budget: {
      type: Number,
      min: [0, 'Budget cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
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

// Auto-set endDate when status changes to completed
projectSchema.pre('save', function () {
  if (this.isModified('status') && this.status === 'completed' && !this.endDate) {
    this.endDate = new Date()
  }
})

// Indexes
projectSchema.index({ client: 1 })
projectSchema.index({ status: 1 })
projectSchema.index({ createdBy: 1 })
projectSchema.index({ name: 'text', description: 'text' })

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>('Project', projectSchema)

export default Project
