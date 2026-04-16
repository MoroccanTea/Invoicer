import mongoose, { Schema, Document, Model } from 'mongoose'

export type ActivityType =
  | 'user_login'
  | 'user_logout'
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'client_created'
  | 'client_updated'
  | 'client_deleted'
  | 'project_created'
  | 'project_updated'
  | 'project_completed'
  | 'project_cancelled'
  | 'project_deleted'
  | 'invoice_created'
  | 'invoice_updated'
  | 'invoice_paid'
  | 'invoice_cancelled'
  | 'invoice_deleted'
  | 'config_updated'
  | 'password_changed'

export interface IActivityLog extends Document {
  _id: mongoose.Types.ObjectId
  type: ActivityType
  user: mongoose.Types.ObjectId
  description: string
  entityType?: 'user' | 'client' | 'project' | 'invoice' | 'config'
  entityId?: mongoose.Types.ObjectId
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    type: {
      type: String,
      required: true,
      enum: [
        'user_login',
        'user_logout',
        'user_created',
        'user_updated',
        'user_deleted',
        'client_created',
        'client_updated',
        'client_deleted',
        'project_created',
        'project_updated',
        'project_completed',
        'project_cancelled',
        'project_deleted',
        'invoice_created',
        'invoice_updated',
        'invoice_paid',
        'invoice_cancelled',
        'invoice_deleted',
        'config_updated',
        'password_changed',
      ],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    entityType: {
      type: String,
      enum: ['user', 'client', 'project', 'invoice', 'config'],
    },
    entityId: {
      type: Schema.Types.ObjectId,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

// Indexes
activityLogSchema.index({ user: 1 })
activityLogSchema.index({ type: 1 })
activityLogSchema.index({ createdAt: -1 })
activityLogSchema.index({ entityType: 1, entityId: 1 })

// TTL index - automatically delete logs after 1 year
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 })

const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>('ActivityLog', activityLogSchema)

export async function logActivity(
  type: ActivityType,
  userId: mongoose.Types.ObjectId | string,
  description: string,
  options?: {
    entityType?: 'user' | 'client' | 'project' | 'invoice' | 'config'
    entityId?: mongoose.Types.ObjectId | string
    metadata?: Record<string, any>
    ipAddress?: string
    userAgent?: string
  }
): Promise<IActivityLog> {
  return ActivityLog.create({
    type,
    user: userId,
    description,
    entityType: options?.entityType,
    entityId: options?.entityId,
    metadata: options?.metadata,
    ipAddress: options?.ipAddress,
    userAgent: options?.userAgent,
  })
}

export default ActivityLog
